import type { GiftAidClaimGiftRecord } from './gift-aid-claim.types';

export const computeClaimBatchRollups = (gifts: GiftAidClaimGiftRecord[]) => {
  const claimableGifts = gifts.filter((gift) => gift.giftAidStatus === 'CLAIMABLE');
  const blockingIssueCount = gifts.filter(
    (gift) => gift.giftAidStatus !== 'CLAIMABLE',
  ).length;

  return {
    giftCount: gifts.length,
    totalAmount: {
      amountMicros: claimableGifts.reduce(
        (sum, gift) => sum + (gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode:
        claimableGifts.find((gift) => gift.amount?.currencyCode)?.amount
          ?.currencyCode ?? 'GBP',
    },
    hasBlockingIssues: blockingIssueCount > 0,
    blockingIssueCount,
  };
};
