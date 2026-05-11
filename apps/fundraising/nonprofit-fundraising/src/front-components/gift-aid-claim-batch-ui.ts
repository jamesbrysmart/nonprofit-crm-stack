import { AppPath, navigate } from 'twenty-sdk/front-component';

export type GiftQueueScope =
  | 'claim'
  | 'claim-blockers'
  | 'needs-review'
  | 'needs-review-outside-claim';

export const formatAmount = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null
    | undefined,
) => {
  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Unknown amount';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: amount.currencyCode ?? 'GBP',
  }).format(amount.amountMicros / 1_000_000);
};

export const buildGiftQueryParams = (
  batchId: string,
  scope: GiftQueueScope,
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {};

  switch (scope) {
    case 'claim':
      queryParams['filter[giftAidClaimBatch][IS]'] = [batchId];
      break;
    case 'claim-blockers':
      queryParams['filter[giftAidClaimBatch][IS]'] = [batchId];
      queryParams['filter[giftAidStatus][IS_NOT]'] = ['CLAIMABLE'];
      break;
    case 'needs-review':
      queryParams['filter[giftAidStatus][IS]'] = ['NEEDS_REVIEW'];
      break;
    case 'needs-review-outside-claim':
      queryParams['filter[giftAidStatus][IS]'] = ['NEEDS_REVIEW'];
      queryParams['filter[giftAidClaimBatch][IS_NOT]'] = [batchId];
      break;
    default:
      break;
  }

  return queryParams;
};

export const openGiftQueue = async (batchId: string, scope: GiftQueueScope) => {
  await navigate(
    AppPath.RecordIndexPage,
    {
      objectNamePlural: 'gifts',
    },
    buildGiftQueryParams(batchId, scope),
  );
};
