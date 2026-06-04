import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  ResolvedSoftCreditSelection,
  SoftCreditType,
} from 'src/soft-credits/soft-credit-integrity';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export type AppealSourceFundraiser = {
  fundraiserPersonId: string;
  fundraiserCompanyId: string;
};

export type ExistingSoftCreditState = {
  softCreditPersonId: string;
  softCreditCompanyId: string;
  softCreditType: string;
};

const EMPTY_APPEAL_SOURCE_FUNDRAISER: AppealSourceFundraiser = {
  fundraiserPersonId: '',
  fundraiserCompanyId: '',
};

export const loadAppealSourceFundraisersById = async (
  client: CoreApiClient,
  appealSourceIds: string[],
): Promise<Record<string, AppealSourceFundraiser>> => {
  const normalizedIds = [...new Set(appealSourceIds.map(normalizeString))].filter(
    (appealSourceId) => appealSourceId !== '',
  );

  if (normalizedIds.length === 0) {
    return {};
  }

  const result = await client.query({
    appealSources: {
      __args: {
        first: normalizedIds.length,
        filter: {
          id: {
            in: normalizedIds,
          },
        },
      },
      edges: {
        node: {
          id: true,
          fundraiserPerson: {
            id: true,
          },
          fundraiserCompany: {
            id: true,
          },
        },
      },
    },
  } as any);

  const records =
    result?.appealSources?.edges?.map(
      (edge: {
        node: {
          id?: string | null;
          fundraiserPerson?: { id?: string | null } | null;
          fundraiserCompany?: { id?: string | null } | null;
        };
      }) => edge.node,
    ) ?? [];

  return Object.fromEntries(
    records
      .map((record) => {
        const appealSourceId = normalizeString(record.id);

        if (appealSourceId === '') {
          return null;
        }

        return [
          appealSourceId,
          {
            fundraiserPersonId: normalizeString(record.fundraiserPerson?.id),
            fundraiserCompanyId: normalizeString(record.fundraiserCompany?.id),
          },
        ];
      })
      .filter(
        (
          entry,
        ): entry is [string, AppealSourceFundraiser] => entry !== null,
      ),
  );
};

const hasLinkedFundraiser = (appealSourceFundraiser: AppealSourceFundraiser) =>
  appealSourceFundraiser.fundraiserPersonId !== '' ||
  appealSourceFundraiser.fundraiserCompanyId !== '';

export const isFundraiserSoftCreditDerivedFromAppealSource = ({
  softCredit,
  appealSourceFundraiser,
}: {
  softCredit: ExistingSoftCreditState;
  appealSourceFundraiser: AppealSourceFundraiser;
}) => {
  if (!hasLinkedFundraiser(appealSourceFundraiser)) {
    return false;
  }

  if (normalizeString(softCredit.softCreditType).toUpperCase() !== 'FUNDRAISER') {
    return false;
  }

  if (appealSourceFundraiser.fundraiserPersonId !== '') {
    return (
      normalizeString(softCredit.softCreditPersonId) ===
        appealSourceFundraiser.fundraiserPersonId &&
      normalizeString(softCredit.softCreditCompanyId) === ''
    );
  }

  if (appealSourceFundraiser.fundraiserCompanyId !== '') {
    return (
      normalizeString(softCredit.softCreditCompanyId) ===
        appealSourceFundraiser.fundraiserCompanyId &&
      normalizeString(softCredit.softCreditPersonId) === ''
    );
  }

  return false;
};

const buildFundraiserSoftCreditSelection = ({
  fundraiserPersonId,
  fundraiserCompanyId,
}: AppealSourceFundraiser): ResolvedSoftCreditSelection => ({
  mode: 'set',
  softCreditPersonId: fundraiserPersonId,
  softCreditCompanyId: fundraiserCompanyId,
  softCreditType: 'FUNDRAISER' satisfies SoftCreditType,
});

export const deriveFundraiserSoftCreditSelection = ({
  currentSoftCredit,
  currentAppealSourceFundraiser,
  nextAppealSourceFundraiser,
  requestedSoftCreditSelection,
}: {
  currentSoftCredit: ExistingSoftCreditState;
  currentAppealSourceFundraiser?: AppealSourceFundraiser;
  nextAppealSourceFundraiser?: AppealSourceFundraiser;
  requestedSoftCreditSelection: ResolvedSoftCreditSelection;
}): ResolvedSoftCreditSelection => {
  if (requestedSoftCreditSelection.mode !== 'unchanged') {
    return requestedSoftCreditSelection;
  }

  const normalizedCurrentAppealSourceFundraiser =
    currentAppealSourceFundraiser ?? EMPTY_APPEAL_SOURCE_FUNDRAISER;
  const normalizedNextAppealSourceFundraiser =
    nextAppealSourceFundraiser ?? EMPTY_APPEAL_SOURCE_FUNDRAISER;

  if (hasLinkedFundraiser(normalizedNextAppealSourceFundraiser)) {
    return buildFundraiserSoftCreditSelection(
      normalizedNextAppealSourceFundraiser,
    );
  }

  if (
    isFundraiserSoftCreditDerivedFromAppealSource({
      softCredit: currentSoftCredit,
      appealSourceFundraiser: normalizedCurrentAppealSourceFundraiser,
    })
  ) {
    return {
      mode: 'clear',
      softCreditPersonId: '',
      softCreditCompanyId: '',
      softCreditType: '',
    };
  }

  return requestedSoftCreditSelection;
};
