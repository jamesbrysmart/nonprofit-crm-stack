import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/fund.object';

export const FUNDS_VIEW_UNIVERSAL_IDENTIFIER =
  'd90d5496-3157-482e-b02f-c50c175e7e38';

export default defineView({
  universalIdentifier: FUNDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Funds',
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconPigMoney',
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: '8fcd0d96-d573-4e3f-a3c4-31ef0ea269b6',
      fieldMetadataUniversalIdentifier: FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '57c2cd53-c53c-4f4e-8441-0d418bb45067',
      fieldMetadataUniversalIdentifier: FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '5f3f1034-a50f-4e0a-a691-e4fd4563d21c',
      fieldMetadataUniversalIdentifier:
        FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '52309d58-924f-4d70-a084-ebea1bd822b7',
      fieldMetadataUniversalIdentifier:
        FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4c4c9e9e-97c0-4114-9cee-7734c2cac572',
      fieldMetadataUniversalIdentifier: FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 120,
    },
  ],
});
