import type {
  AppealSourceSummary,
  AppealSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const getFundIdForAppealSelection = ({
  appeals,
  nextAppealId,
  currentFundId,
}: {
  appeals: AppealSummary[];
  nextAppealId: string;
  currentFundId: string;
}) => {
  const normalizedCurrentFundId = normalizeString(currentFundId);

  if (normalizedCurrentFundId !== '') {
    return normalizedCurrentFundId;
  }

  const normalizedAppealId = normalizeString(nextAppealId);

  if (normalizedAppealId === '') {
    return normalizedCurrentFundId;
  }

  const nextAppeal = appeals.find(
    (appeal) => normalizeString(appeal.id) === normalizedAppealId,
  );

  return normalizeString(nextAppeal?.defaultFund?.id);
};

export const getAppealSourceIdsForAppeal = ({
  appealSources,
  appealId,
}: {
  appealSources: AppealSourceSummary[];
  appealId: string;
}) => {
  const normalizedAppealId = normalizeString(appealId);

  if (normalizedAppealId === '') {
    return null;
  }

  return new Set(
    appealSources
      .filter(
        (appealSource) =>
          normalizeString(appealSource.appeal?.id) === normalizedAppealId,
      )
      .map((appealSource) => normalizeString(appealSource.id))
      .filter((appealSourceId) => appealSourceId !== ''),
  );
};

export const getAppealIdForAppealSourceSelection = ({
  appealSources,
  nextAppealSourceId,
}: {
  appealSources: AppealSourceSummary[];
  nextAppealSourceId: string;
}) => {
  const normalizedAppealSourceId = normalizeString(nextAppealSourceId);

  if (normalizedAppealSourceId === '') {
    return '';
  }

  const nextAppealSource = appealSources.find(
    (appealSource) =>
      normalizeString(appealSource.id) === normalizedAppealSourceId,
  );

  return normalizeString(nextAppealSource?.appeal?.id);
};
