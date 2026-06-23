import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  extractConnectionNodes,
  extractMutationRecord,
  extractQueryRecord,
} from 'src/core-api/core-api-results';
import type {
  GiftAidDeclarationRecord,
  GiftAidDeclarationStatus,
  GiftAidEvaluatedPayload,
} from './gift-aid.types';

const normalizeString = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;

const parseDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const buildDeclarationName = (
  donorFirstName?: string | null,
  donorLastName?: string | null,
  declarationDate?: string | null,
) => {
  const donorName = `${normalizeString(donorFirstName) ?? ''} ${normalizeString(donorLastName) ?? ''}`.trim();
  const normalizedDate = normalizeString(declarationDate);

  if (donorName && normalizedDate) {
    return `${donorName} declaration ${normalizedDate}`;
  }

  if (donorName) {
    return `${donorName} Gift Aid declaration`;
  }

  return 'Gift Aid declaration';
};

const normalizeDeclarationStatus = (
  value: string | null | undefined,
): GiftAidDeclarationStatus | undefined => {
  return value === 'ACTIVE' ||
    value === 'INSUFFICIENT' ||
    value === 'REVOKED' ||
    value === 'SUPERSEDED'
    ? value
    : undefined;
};

const supportsHistoricalCoverage = (scope: string | null | undefined) => {
  const normalized = normalizeString(scope)?.toLowerCase();

  return (
    normalized === 'past_and_future' ||
    normalized === 'historical_and_future' ||
    normalized === 'retrospective_and_future' ||
    normalized === 'all' ||
    normalized === 'both'
  );
};

export const createGiftAidDeclarationService = (client: CoreApiClient) => {
  const declarationsById = new Map<string, GiftAidDeclarationRecord>();
  const declarationsByPersonId = new Map<string, GiftAidDeclarationRecord[]>();

  const getGiftAidDeclarationById = async (
    declarationId: string,
  ): Promise<GiftAidDeclarationRecord | undefined> => {
    if (declarationsById.has(declarationId)) {
      return declarationsById.get(declarationId);
    }

    const result = await client.query({
      giftAidDeclaration: {
        __args: {
          filter: {
            id: { eq: declarationId },
          },
        },
        id: true,
        status: true,
        statusReason: true,
        declarationDate: true,
        coverageScope: true,
        source: true,
        textVersion: true,
        revokedAt: true,
        person: {
          id: true,
        },
      },
    } as any);

    const declaration = extractQueryRecord<GiftAidDeclarationRecord>(
      result,
      'giftAidDeclaration',
    );

    if (declaration?.id) {
      declarationsById.set(declaration.id, declaration);
    }

    return declaration;
  };

  const listGiftAidDeclarationsForPerson = async (
    personId: string,
  ): Promise<GiftAidDeclarationRecord[]> => {
    if (declarationsByPersonId.has(personId)) {
      return declarationsByPersonId.get(personId) ?? [];
    }

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
            statusReason: true,
            declarationDate: true,
            coverageScope: true,
            source: true,
            textVersion: true,
            revokedAt: true,
            person: {
              id: true,
            },
          },
        },
      },
    } as any);

    const declarations = extractConnectionNodes<GiftAidDeclarationRecord>(
      result,
      'giftAidDeclarations',
    );

    declarationsByPersonId.set(personId, declarations);
    for (const declaration of declarations) {
      declarationsById.set(declaration.id, declaration);
    }

    return declarations;
  };

  const ensureGiftAidDeclarationForPayload = async (
    payload: GiftAidEvaluatedPayload,
  ): Promise<GiftAidEvaluatedPayload> => {
    const donorId = normalizeString(payload.donorId);

    if (
      payload.giftAidRequested !== true ||
      payload.giftAidDeclarationCaptured !== true ||
      normalizeString(payload.giftAidDeclarationId) ||
      !donorId
    ) {
      return payload;
    }

    const hasSufficientIdentity =
      normalizeString(payload.donorFirstName) &&
      normalizeString(payload.donorLastName);
    const status: GiftAidDeclarationStatus = hasSufficientIdentity
      ? 'ACTIVE'
      : 'INSUFFICIENT';
    const statusReason = hasSufficientIdentity ? undefined : 'donor_data_incomplete';

    const result = await client.mutation({
      createGiftAidDeclaration: {
        __args: {
          data: {
            name: buildDeclarationName(
              payload.donorFirstName,
              payload.donorLastName,
              payload.giftAidDeclarationDate,
            ),
            personId: donorId,
            declarationDate: normalizeString(payload.giftAidDeclarationDate),
            coverageScope: normalizeString(payload.giftAidCoverageScope),
            source: normalizeString(payload.giftAidDeclarationSource),
            textVersion: normalizeString(payload.giftAidTextVersion),
            status,
            ...(statusReason ? { statusReason } : {}),
          },
        },
        id: true,
        status: true,
        statusReason: true,
        declarationDate: true,
        coverageScope: true,
        source: true,
        textVersion: true,
        revokedAt: true,
        person: {
          id: true,
        },
      },
    } as any);

    const declaration = extractMutationRecord<GiftAidDeclarationRecord>(
      result,
      'createGiftAidDeclaration',
    );

    if (declaration?.id) {
      declarationsById.set(declaration.id, declaration);
      const existing = declarationsByPersonId.get(donorId) ?? [];
      declarationsByPersonId.set(donorId, [declaration, ...existing]);
    }

    return {
      ...payload,
      giftAidDeclarationId:
        declaration?.id ?? payload.giftAidDeclarationId ?? null,
    };
  };

  const resolveApplicableGiftAidDeclaration = async (
    payload: GiftAidEvaluatedPayload,
  ): Promise<GiftAidDeclarationRecord | undefined> => {
    const explicitDeclarationId = normalizeString(payload.giftAidDeclarationId);
    if (explicitDeclarationId) {
      return await getGiftAidDeclarationById(explicitDeclarationId);
    }

    const donorId = normalizeString(payload.donorId);
    if (!donorId) {
      return undefined;
    }

    const declarations = await listGiftAidDeclarationsForPerson(donorId);
    const giftDate = parseDate(payload.giftDate);

    const applicable = declarations.filter((declaration) => {
      const status = normalizeDeclarationStatus(declaration.status);
      if (status && status !== 'ACTIVE') {
        return false;
      }

      if (normalizeString(declaration.revokedAt)) {
        return false;
      }

      const declarationDate = parseDate(declaration.declarationDate);
      if (!giftDate || !declarationDate) {
        return true;
      }

      return (
        giftDate >= declarationDate ||
        supportsHistoricalCoverage(declaration.coverageScope)
      );
    });

    return applicable.sort((left, right) => {
      const leftDate = parseDate(left.declarationDate)?.getTime() ?? 0;
      const rightDate = parseDate(right.declarationDate)?.getTime() ?? 0;
      return rightDate - leftDate;
    })[0];
  };

  return {
    ensureGiftAidDeclarationForPayload,
    getGiftAidDeclarationById,
    resolveApplicableGiftAidDeclaration,
  };
};

export type GiftAidDeclarationService = ReturnType<
  typeof createGiftAidDeclarationService
>;
