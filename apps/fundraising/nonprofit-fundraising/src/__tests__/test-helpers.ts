import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const getCoreClient = () => new CoreApiClient();

export const getMetadataClient = () => new MetadataApiClient();

export const findInstalledApplication = async () => {
  const client = getMetadataClient();
  const result = await client.query({
    findManyApplications: {
      id: true,
      name: true,
      universalIdentifier: true,
    },
  });

  return result.findManyApplications.find(
    (application: { universalIdentifier: string }) =>
      application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
  );
};

const getApiConfig = () => {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'TWENTY_API_URL and TWENTY_API_KEY must be set for integration tests',
    );
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    apiKey,
  };
};

export const callAppRoute = async <TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> => {
  const { apiUrl, apiKey } = getApiConfig();
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Route call failed with status ${response.status}`);
  }

  return JSON.parse(rawBody) as TResponse;
};

export const createPerson = async ({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email?: string;
}) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName,
            lastName,
          },
          ...(email
            ? {
                emails: {
                  primaryEmail: email,
                },
              }
            : {}),
        },
      },
      id: true,
      name: {
        firstName: true,
        lastName: true,
      },
      emails: {
        primaryEmail: true,
      },
      supporterEmailOptOut: true,
    },
  } as any);

  return result.createPerson as {
    id: string;
    name?: { firstName?: string | null; lastName?: string | null } | null;
    emails?: { primaryEmail?: string | null } | null;
    supporterEmailOptOut?: boolean | null;
  };
};

export const loadPeopleByName = async (firstName: string, lastName: string) => {
  const client = getCoreClient();
  const result = await client.query({
    people: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              name: {
                firstName: {
                  eq: firstName,
                },
              },
            },
            {
              name: {
                lastName: {
                  eq: lastName,
                },
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
          supporterEmailOptOut: true,
        },
      },
    },
  } as any);

  return (
    result?.people?.edges?.map((edge: { node: unknown }) => edge.node) ?? []
  ) as Array<{
    id: string;
    name?: { firstName?: string | null; lastName?: string | null } | null;
    emails?: { primaryEmail?: string | null } | null;
    supporterEmailOptOut?: boolean | null;
  }>;
};

export const loadGiftById = async (giftId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: giftId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      giftDate: true,
      giftType: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftAidStatus: true,
      giftAidReasonCode: true,
      giftAidDecisionSource: true,
      giftAidLastEvaluatedAt: true,
      giftAidDeclaration: {
        id: true,
        source: true,
      },
      giftAidClaimBatch: {
        id: true,
        name: true,
        status: true,
      },
      recurringAgreement: {
        id: true,
        name: true,
        nextExpectedAt: true,
      },
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
        mailingAddress: {
          addressStreet1: true,
          addressStreet2: true,
          addressCity: true,
          addressState: true,
          addressPostcode: true,
          addressCountry: true,
        },
      },
    },
  } as any);

  return result?.gift ?? null;
};

export const loadGiftStagingById = async (giftStagingId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: giftStagingId },
        },
      },
      id: true,
      name: true,
      intakeSource: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      donationType: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorPhone: true,
      supporterEmailOptOut: true,
      donorMailingAddress: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      providerAgreementId: true,
      providerIntervalUnit: true,
      providerIntervalCount: true,
      donationFormId: true,
      donationFormPublishedVersion: true,
      rawProviderEvidence: true,
      sourceAppealName: true,
      sourceFundName: true,
      donorResolutionState: true,
      markedReady: true,
      giftReadyStatus: true,
      paymentState: true,
      processingStatus: true,
    },
  } as any);

  return result?.giftStaging ?? null;
};

export const createRecurringAgreement = async ({
  name,
  personId,
  provider = 'MANUAL',
  providerAgreementId,
}: {
  name: string;
  personId: string;
  provider?: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerAgreementId?: string;
}) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createRecurringAgreement: {
      __args: {
        data: {
          name,
          status: 'ACTIVE',
          cadence: 'MONTHLY',
          intervalCount: 1,
          amount: {
            currencyCode: 'GBP',
            amountMicros: 15_000_000,
          },
          startDate: '2026-01-01',
          nextExpectedAt: '2026-04-21',
          provider,
          ...(providerAgreementId ? { providerAgreementId } : {}),
          person: {
            connect: {
              where: {
                id: personId,
              },
            },
          },
        },
      },
      id: true,
      name: true,
      nextExpectedAt: true,
    },
  } as any);

  return result.createRecurringAgreement as {
    id: string;
    name: string;
    nextExpectedAt?: string | null;
  };
};

export const loadRecurringAgreementById = async (recurringAgreementId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    recurringAgreement: {
      __args: {
        filter: {
          id: { eq: recurringAgreementId },
        },
      },
      id: true,
      name: true,
      provider: true,
      providerAgreementId: true,
      nextExpectedAt: true,
    },
  } as any);

  return result?.recurringAgreement ?? null;
};

export const loadCurrentGiftAidClaimBatch = async () => {
  const client = getCoreClient();
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 10,
        filter: {
          status: {
            eq: 'DRAFT',
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          giftCount: true,
          blockingIssueCount: true,
        },
      },
    },
  } as any);

  return result?.giftAidClaimBatches?.edges?.[0]?.node ?? null;
};

export const loadGiftAidDeclarationsForPerson = async (personId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 100,
        filter: {
          personId: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          status: true,
          source: true,
          declarationDate: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: unknown }) => edge.node,
    ) ?? []
  ) as Array<{
    id: string;
    status?: string | null;
    source?: string | null;
    declarationDate?: string | null;
  }>;
};
