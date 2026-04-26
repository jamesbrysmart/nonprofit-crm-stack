export const isGiftAidEnabled = () =>
  (process.env.GIFT_AID_ENABLED ?? 'true').toLowerCase() === 'true';
