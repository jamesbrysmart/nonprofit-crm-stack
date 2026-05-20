import type { AppealSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

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
