import { CoreApiClient } from 'twenty-client-sdk/core';

export const markGiftsChecked = async (giftIds: string[]) => {
  const uniqueGiftIds = [...new Set(giftIds)];
  const client = new CoreApiClient();
  const checkedAt = new Date().toISOString();

  for (const giftId of uniqueGiftIds) {
    await client.mutation({
      updateGift: {
        __args: { id: giftId, data: { giftAidCheckedAt: checkedAt } },
        id: true,
      },
    });
  }

  return { checkedGiftCount: uniqueGiftIds.length, checkedAt };
};
