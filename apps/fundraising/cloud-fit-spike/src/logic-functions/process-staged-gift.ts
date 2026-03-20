import { defineLogicFunction } from 'twenty-sdk';
import {
  canCreatePersonFromContact,
  canLookupDuplicateDonors,
  chooseResolvedPersonId,
  normalizeDonorResolutionContact,
  pickPreferredDuplicatePersonId,
} from 'src/domain/donor-resolution';
import {
  buildGiftCreateInput,
  calculateNextExpectedAt,
  canProcessGiftStaging,
  type GiftStagingProcessingPayload,
  normalizeGiftStagingRecord,
  parseGiftStagingRawPayload,
  hasValidGiftProcessingPayload,
} from 'src/logic-functions/utils/process-staged-gift.util';

export interface ProcessStagedGiftArgs {
  stagingId?: string;
}

export type ProcessStagedGiftDeferredReason =
  | 'not_ready'
  | 'locked'
  | 'missing_payload';

export type ProcessStagedGiftErrorReason =
  | 'fetch_failed'
  | 'payload_invalid'
  | 'gift_api_failed';

export type ProcessStagedGiftResult =
  | { status: 'processed'; stagingId: string; giftId: string }
  | {
      status: 'deferred';
      stagingId: string;
      reason: ProcessStagedGiftDeferredReason;
    }
  | { status: 'error'; stagingId: string; error: ProcessStagedGiftErrorReason };

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: Array<{ message?: string }>;
};

const getTwentyApiToken = (): string | undefined => {
  const appAccessToken = process.env.TWENTY_APP_ACCESS_TOKEN?.trim();

  if (appAccessToken) {
    return appAccessToken;
  }

  const apiKey = process.env.TWENTY_API_KEY?.trim();

  return apiKey || undefined;
};

const getTwentyApiUrl = (): string => {
  const apiUrl = process.env.TWENTY_API_URL?.trim();

  if (!apiUrl) {
    throw new Error('TWENTY_API_URL is not configured');
  }

  return apiUrl.replace(/\/$/, '');
};

const getTwentyRestBaseUrl = (): string => `${getTwentyApiUrl()}/rest`;

const graphqlRequest = async <TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> => {
  const token = getTwentyApiToken();

  if (!token) {
    throw new Error(
      'Neither TWENTY_APP_ACCESS_TOKEN nor TWENTY_API_KEY is configured',
    );
  }

  const response = await fetch(`${getTwentyApiUrl()}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const body = (await response.json()) as GraphqlResponse<TData>;

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(
      body.errors
        .map((error) => error.message ?? 'Unknown GraphQL error')
        .join('; '),
    );
  }

  if (body.data === undefined) {
    throw new Error('GraphQL response missing data');
  }

  return body.data;
};

// Temporary spike workaround: `twenty-sdk/clients` currently fails during
// `app:build` in the published SDK, so this function uses direct GraphQL/REST
// calls to keep testing app fit without changing the workflow semantics.
const fetchGiftStaging = async (stagingId: string) => {
  const data = await graphqlRequest<{
    giftStaging?: Record<string, unknown>;
  }>(
    `
      query GetGiftStaging($stagingId: UUID!) {
        giftStaging(filter: { id: { eq: $stagingId } }) {
          id
          processingStatus
          validationStatus
          dedupeStatus
          rawPayload
          expectedAt
          giftDate
          createdAt
          donor {
            id
          }
          company {
            id
          }
          fund {
            id
          }
          appeal {
            id
          }
          opportunity {
            id
          }
          recurringAgreement {
            id
          }
          gift {
            id
          }
        }
      }
    `,
    { stagingId },
  );

  return data.giftStaging
    ? normalizeGiftStagingRecord(data.giftStaging)
    : undefined;
};

const updateGiftStaging = async (
  stagingId: string,
  data: Record<string, unknown>,
) => {
  await graphqlRequest(
    `
      mutation UpdateGiftStaging($stagingId: UUID!, $data: GiftStagingUpdateInput!) {
        updateGiftStaging(id: $stagingId, data: $data) {
          id
        }
      }
    `,
    { stagingId, data },
  );
};

const setProcessingError = async (
  stagingId: string,
  errorDetail: string,
) => {
  try {
    await updateGiftStaging(stagingId, {
      processingStatus: 'process_failed',
      errorDetail,
    });
  } catch (error) {
    console.warn(
      '[process-staged-gift] Failed to persist processing error',
      stagingId,
      error instanceof Error ? error.message : String(error),
    );
  }
};

const lookupDuplicatePersonId = async (
  payload: GiftStagingProcessingPayload,
) => {
  const contact = normalizeDonorResolutionContact(payload);

  if (!canLookupDuplicateDonors(contact)) {
    return undefined;
  }

  const token = getTwentyApiToken();

  if (!token) {
    throw new Error(
      'Neither TWENTY_APP_ACCESS_TOKEN nor TWENTY_API_KEY is configured',
    );
  }

  const response = await fetch(
    `${getTwentyRestBaseUrl()}/people/duplicates?depth=0`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [
          {
            name: {
              firstName: contact.firstName,
              lastName: contact.lastName,
            },
            ...(contact.email
              ? {
                  emails: {
                    primaryEmail: contact.email,
                  },
                }
              : {}),
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Duplicate lookup failed with status ${response.status}`);
  }

  const body = (await response.json()) as unknown;
  const candidates = pickPreferredDuplicatePersonId(body, contact.email);

  return candidates?.emailMatchedId ?? candidates?.fallbackId;
};

const findExistingPersonId = async (
  payload: GiftStagingProcessingPayload,
) => {
  const contact = normalizeDonorResolutionContact(payload);
  const donorEmail = contact.email ?? '';
  const donorFirstName = contact.firstName ?? '';
  const donorLastName = contact.lastName ?? '';
  let duplicateMatchedId: string | undefined;

  try {
    duplicateMatchedId = await lookupDuplicatePersonId(payload);

    if (duplicateMatchedId) {
      return duplicateMatchedId;
    }
  } catch (error) {
    console.warn(
      '[process-staged-gift] Duplicate lookup failed, falling back to direct person query',
      error instanceof Error ? error.message : String(error),
    );
  }

  if (donorEmail) {
    const byEmail = await graphqlRequest<{
      people?: {
        edges?: Array<{ node?: { id?: string } }>;
      };
    }>(
      `
        query FindPersonByEmail($primaryEmail: String!) {
          people(
            filter: {
              emails: {
                primaryEmail: { eq: $primaryEmail }
              }
            }
          ) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      { primaryEmail: donorEmail },
    );

    const matchedByEmail = byEmail.people?.edges?.[0]?.node?.id;

    if (typeof matchedByEmail === 'string' && matchedByEmail.trim().length > 0) {
      return chooseResolvedPersonId({
        duplicateMatchedId,
        emailMatchedId: matchedByEmail,
      });
    }
  }

  if (!donorFirstName || !donorLastName) {
    return undefined;
  }

  const byName = await graphqlRequest<{
    people?: {
      edges?: Array<{ node?: { id?: string } }>;
    };
  }>(
    `
      query FindPersonByName($firstName: String!, $lastName: String!) {
        people(
          filter: {
            name: {
              firstName: { ilike: $firstName }
              lastName: { ilike: $lastName }
            }
          }
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    {
      firstName: `%${donorFirstName}%`,
      lastName: `%${donorLastName}%`,
    },
  );

  const matchedByName = byName.people?.edges?.[0]?.node?.id;

  return typeof matchedByName === 'string' && matchedByName.trim().length > 0
    ? chooseResolvedPersonId({
        duplicateMatchedId,
        nameMatchedId: matchedByName,
      })
    : duplicateMatchedId;
};

const createPersonFromPayload = async (
  payload: GiftStagingProcessingPayload,
) => {
  const contact = normalizeDonorResolutionContact(payload);

  if (!canCreatePersonFromContact(contact)) {
    return undefined;
  }

  const data = await graphqlRequest<{
    createPerson?: { id?: string };
  }>(
    `
      mutation CreatePerson($data: PersonCreateInput!) {
        createPerson(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        name: {
          firstName: contact.firstName,
          lastName: contact.lastName,
        },
        ...(contact.email
          ? {
              emails: {
                primaryEmail: contact.email,
              },
            }
          : {}),
      },
    },
  );

  return typeof data.createPerson?.id === 'string' &&
    data.createPerson.id.trim().length > 0
    ? data.createPerson.id
    : undefined;
};

const resolveDonorIdentity = async (
  stagingId: string,
  payload: GiftStagingProcessingPayload,
) => {
  if (
    (typeof payload.donorId === 'string' && payload.donorId.trim().length > 0) ||
    (typeof payload.companyId === 'string' &&
      payload.companyId.trim().length > 0)
  ) {
    return payload;
  }

  const existingPersonId = await findExistingPersonId(payload);
  const donorId = existingPersonId ?? (await createPersonFromPayload(payload));

  if (!donorId) {
    return payload;
  }

  const resolvedPayload: GiftStagingProcessingPayload = {
    ...payload,
    donorId,
  };

  await updateGiftStaging(stagingId, {
    donorId,
    donorFirstName:
      typeof payload.donorFirstName === 'string' ? payload.donorFirstName : null,
    donorLastName:
      typeof payload.donorLastName === 'string' ? payload.donorLastName : null,
    donorEmail:
      typeof payload.donorEmail === 'string' ? payload.donorEmail : null,
  });

  return resolvedPayload;
};

const createGiftFromPayload = async (
  payload: GiftStagingProcessingPayload,
) => {
  const data = await graphqlRequest<{
    createGift?: { id?: string };
  }>(
    `
      mutation CreateGift($data: GiftCreateInput!) {
        createGift(data: $data) {
          id
        }
      }
    `,
    {
      data: buildGiftCreateInput(payload),
    },
  );

  return typeof data.createGift?.id === 'string' &&
    data.createGift.id.trim().length > 0
    ? data.createGift.id
    : undefined;
};

const updateRecurringAgreement = async (
  recurringAgreementId: string,
  nextExpectedAt: string | undefined,
) => {
  await graphqlRequest(
    `
      mutation UpdateRecurringAgreement(
        $recurringAgreementId: UUID!
        $data: RecurringAgreementUpdateInput!
      ) {
        updateRecurringAgreement(id: $recurringAgreementId, data: $data) {
          id
        }
      }
    `,
    {
      recurringAgreementId,
      data: {
        nextExpectedAt,
        status: 'active',
      },
    },
  );
};

const handler = async (
  params: ProcessStagedGiftArgs,
): Promise<ProcessStagedGiftResult> => {
  const stagingId =
    typeof params?.stagingId === 'string' ? params.stagingId.trim() : '';

  if (!stagingId) {
    throw new Error('stagingId is required');
  }

  const stagingRecord = await fetchGiftStaging(stagingId);

  if (!stagingRecord) {
    return {
      status: 'error',
      stagingId,
      error: 'fetch_failed',
    };
  }

  if (
    stagingRecord.processingStatus === 'processed' &&
    typeof stagingRecord.giftId === 'string' &&
    stagingRecord.giftId.trim().length > 0
  ) {
    return {
      status: 'processed',
      stagingId,
      giftId: stagingRecord.giftId,
    };
  }

  if (stagingRecord.processingStatus === 'processing') {
    return {
      status: 'deferred',
      stagingId,
      reason: 'locked',
    };
  }

  if (!canProcessGiftStaging(stagingRecord)) {
    return {
      status: 'deferred',
      stagingId,
      reason: 'not_ready',
    };
  }

  if (!stagingRecord.rawPayload) {
    await setProcessingError(stagingId, 'Staging record missing raw payload');

    return {
      status: 'deferred',
      stagingId,
      reason: 'missing_payload',
    };
  }

  const parsedPayload = parseGiftStagingRawPayload(stagingRecord.rawPayload);

  if (!parsedPayload) {
    await setProcessingError(stagingId, 'Failed to parse staging raw payload');

    return {
      status: 'deferred',
      stagingId,
      reason: 'missing_payload',
    };
  }

  let resolvedPayload: GiftStagingProcessingPayload;

  try {
    resolvedPayload = await resolveDonorIdentity(stagingId, parsedPayload);
  } catch (error) {
    await setProcessingError(
      stagingId,
      error instanceof Error
        ? error.message
        : 'Failed to resolve donor identity for staging payload',
    );

    return {
      status: 'error',
      stagingId,
      error: 'gift_api_failed',
    };
  }

  if (!hasValidGiftProcessingPayload(resolvedPayload)) {
    await setProcessingError(
      stagingId,
      'Staging payload missing required fields for gift creation',
    );

    return {
      status: 'error',
      stagingId,
      error: 'payload_invalid',
    };
  }

  await updateGiftStaging(stagingId, {
    processingStatus: 'processing',
    errorDetail: null,
  });

  let giftId: string | undefined;

  try {
    giftId = await createGiftFromPayload(resolvedPayload);
  } catch (error) {
    await setProcessingError(
      stagingId,
      error instanceof Error ? error.message : 'Failed to create gift',
    );

    return {
      status: 'error',
      stagingId,
      error: 'gift_api_failed',
    };
  }

  if (!giftId) {
    await setProcessingError(
      stagingId,
      'Create gift response missing gift id',
    );

    return {
      status: 'error',
      stagingId,
      error: 'gift_api_failed',
    };
  }

  try {
    await updateGiftStaging(stagingId, {
      processingStatus: 'processed',
      giftId,
      errorDetail: null,
    });
  } catch {
    await setProcessingError(
      stagingId,
      `Gift created (${giftId}) but staging writeback failed`,
    );

    return {
      status: 'error',
      stagingId,
      error: 'gift_api_failed',
    };
  }

  if (
    typeof resolvedPayload.recurringAgreementId === 'string' &&
    resolvedPayload.recurringAgreementId.trim().length > 0
  ) {
    try {
      await updateRecurringAgreement(
        resolvedPayload.recurringAgreementId,
        calculateNextExpectedAt(stagingRecord),
      );
    } catch (error) {
      console.warn(
        '[process-staged-gift] Failed to update recurring agreement',
        stagingId,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return {
    status: 'processed',
    stagingId,
    giftId,
  };
};

export default defineLogicFunction({
  universalIdentifier: '91e557ba-fb74-4bba-a570-ad598a7ab922',
  name: 'process-staged-gift',
  description:
    'Processes a staged fundraising gift into a canonical gift record.',
  timeoutSeconds: 30,
  handler,
});
