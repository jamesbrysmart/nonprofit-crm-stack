import { GIFT_AID_CURRENCY_CODE, isSterlingAmount } from 'src/gift-aid/gift-aid-currency';
import type { GiftAidClaimGiftRecord } from './gift-aid-claim.types';

export const isClaimableInSterling = (gift: GiftAidClaimGiftRecord) =>
  gift.giftAidStatus === 'CLAIMABLE' &&
  isSterlingAmount(gift.amount) &&
  (gift.refundedAmount?.amountMicros ?? 0) === 0;

export const computeClaimBatchRollups = (gifts: GiftAidClaimGiftRecord[]) => {
  const claimableGifts = gifts.filter(isClaimableInSterling);
  const blockingIssueCount = gifts.length - claimableGifts.length;

  return {
    giftCount: gifts.length,
    totalAmount: {
      amountMicros: claimableGifts.reduce(
        (sum, gift) => sum + (gift.amount?.amountMicros ?? 0),
        0,
      ),
      currencyCode: GIFT_AID_CURRENCY_CODE,
    },
    hasBlockingIssues: blockingIssueCount > 0,
    blockingIssueCount,
  };
};
