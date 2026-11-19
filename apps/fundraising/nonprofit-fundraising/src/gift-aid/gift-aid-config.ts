import { readAppVariable } from 'src/app-variables/read-app-variable';
export const isGiftAidEnabled = () =>
  (readAppVariable('GIFT_AID_ENABLED') ?? 'true').toLowerCase() === 'true';
