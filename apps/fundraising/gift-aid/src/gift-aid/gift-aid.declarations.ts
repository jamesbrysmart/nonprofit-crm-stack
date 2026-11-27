import { CoreApiClient } from 'twenty-client-sdk/core';
import type { GiftAidDeclarationRecord, GiftAidEvaluatedPayload } from './gift-aid.types';

const declarationSelection = {
  id: true,
  status: true,
  declarationDate: true,
  coverageScope: true,
  revokedAt: true,
  person: { id: true },
} as const;

const parseDate = (value: string | null | undefined) => {
  if (!value) return undefined;
  const time = Date.parse(value);
  return Number.isNaN(time) ? undefined : time;
};

const supportsHistoricalCoverage = (scope: string | null | undefined) =>
  ['past_and_future', 'historical_and_future', 'retrospective_and_future', 'all', 'both']
    .includes(scope?.trim().toLowerCase() ?? '');

export const createGiftAidDeclarationService = (client: CoreApiClient) => {
  const declarationsById = new Map<string, GiftAidDeclarationRecord>();
  const declarationsByPersonId = new Map<string, GiftAidDeclarationRecord[]>();

  const getGiftAidDeclarationById = async (id: string): Promise<GiftAidDeclarationRecord | undefined> => {
    const cached = declarationsById.get(id);
    if (cached) return cached;

    const { giftAidDeclarations } = await client.query({
      giftAidDeclarations: {
        __args: { first: 1, filter: { id: { eq: id } } },
        edges: { node: declarationSelection },
      },
    });

    if (!giftAidDeclarations) throw new Error('Reading a Gift Aid declaration returned no result');
    const declaration = giftAidDeclarations.edges[0]?.node;
    if (declaration) declarationsById.set(id, declaration);
    return declaration;
  };

  const listGiftAidDeclarationsForPerson = async (personId: string) => {
    const cached = declarationsByPersonId.get(personId);
    if (cached) return cached;

    const declarations: GiftAidDeclarationRecord[] = [];
    let after: string | undefined;
    for (;;) {
      const { giftAidDeclarations } = await client.query({
        giftAidDeclarations: {
          __args: {
            first: 100,
            ...(after ? { after } : {}),
            filter: { personId: { eq: personId } },
          },
          edges: { node: declarationSelection },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });
      if (!giftAidDeclarations) throw new Error('Reading Gift Aid declarations returned no result');
      declarations.push(...giftAidDeclarations.edges.map(({ node }) => node));
      if (!giftAidDeclarations.pageInfo.hasNextPage) break;

      const cursor = giftAidDeclarations.pageInfo.endCursor;
      if (!cursor || cursor === after) {
        throw new Error('Unable to continue loading Gift Aid declarations');
      }
      after = cursor;
    }

    declarationsByPersonId.set(personId, declarations);
    return declarations;
  };

  const ensureGiftAidDeclarationForPayload = async (payload: GiftAidEvaluatedPayload) => {
    const { donorId, giftId, giftAidDeclarationDate } = payload;
    if (
      payload.giftAidRequested !== true ||
      payload.giftAidDeclarationCaptured !== true ||
      payload.giftAidDeclarationId ||
      !donorId ||
      !giftId
    ) {
      return payload;
    }

    // A capture belongs to one committed Gift. Reusing its UUID as the
    // declaration ID lets Twenty enforce uniqueness across jobs and retries.
    const existing = await getGiftAidDeclarationById(giftId);
    if (existing) return { ...payload, giftAidDeclarationId: existing.id };

    const hasIdentity = Boolean(payload.donorFirstName && payload.donorLastName);
    const hasDate = parseDate(giftAidDeclarationDate) !== undefined;
    const donorName = [payload.donorFirstName, payload.donorLastName].filter(Boolean).join(' ');
    const declarationName = donorName ? `${donorName} Gift Aid declaration` : 'Gift Aid declaration';
    let declaration: GiftAidDeclarationRecord | undefined;
    try {
      const result = await client.mutation({
        createGiftAidDeclaration: {
          __args: {
            data: {
              id: giftId,
              captureGiftId: giftId,
              name: hasDate ? `${declarationName} ${giftAidDeclarationDate}` : declarationName,
              personId: donorId,
              declarationDate: hasDate ? giftAidDeclarationDate : null,
              coverageScope: payload.giftAidCoverageScope,
              source: payload.giftAidDeclarationSource,
              textVersion: payload.giftAidTextVersion,
              status: hasIdentity && hasDate ? 'ACTIVE' : 'INSUFFICIENT',
              ...(!hasIdentity
                ? { statusReason: 'donor_data_incomplete' }
                : !hasDate ? { statusReason: 'declaration_date_required' } : {}),
            },
          },
          ...declarationSelection,
        },
      });
      declaration = result.createGiftAidDeclaration ?? undefined;
    } catch (error) {
      declaration = await getGiftAidDeclarationById(giftId);
      if (!declaration) throw error;
    }

    if (!declaration) throw new Error('Creating a Gift Aid declaration returned no record');
    declarationsById.set(giftId, declaration);
    declarationsByPersonId.delete(donorId);
    return { ...payload, giftAidDeclarationId: declaration.id };
  };

  const resolveApplicableGiftAidDeclaration = async (payload: GiftAidEvaluatedPayload) => {
    const { donorId, giftAidDeclarationId } = payload;
    const giftDate = parseDate(payload.giftDate);
    if (!donorId || giftDate === undefined) return undefined;

    const coversGift = (declaration: GiftAidDeclarationRecord) => {
      const date = parseDate(declaration.declarationDate);
      return (
        declaration.person?.id === donorId &&
        declaration.status === 'ACTIVE' &&
        !declaration.revokedAt &&
        date !== undefined &&
        (giftDate >= date || supportsHistoricalCoverage(declaration.coverageScope))
      );
    };

    if (giftAidDeclarationId) {
      const declaration = await getGiftAidDeclarationById(giftAidDeclarationId);
      return declaration && coversGift(declaration) ? declaration : undefined;
    }

    return (await listGiftAidDeclarationsForPerson(donorId))
      .filter(coversGift)
      .sort((left, right) =>
        (right.declarationDate ?? '').localeCompare(left.declarationDate ?? ''),
      )[0];
  };

  return {
    ensureGiftAidDeclarationForPayload,
    getGiftAidDeclarationById,
    resolveApplicableGiftAidDeclaration,
  };
};

export type GiftAidDeclarationService = ReturnType<typeof createGiftAidDeclarationService>;
