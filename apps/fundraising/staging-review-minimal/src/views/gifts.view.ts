import { defineView, ViewKey } from 'twenty-sdk';
import { DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-gift.field';
import { GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-aid-declaration-on-gift.field';
import {
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift.object';

export const GIFTS_VIEW_UNIVERSAL_IDENTIFIER =
  '07f3d3f4-d7aa-4d66-bd3d-f376305c3de6';

export default defineView({
  universalIdentifier: GIFTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gifts',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconGift',
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: 'e2f155af-4db1-4485-8ee6-a3e7e9eef7ea',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4587d0f8-a3e6-4f17-8f55-69f53fcb0170',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6b703d60-7cee-44cb-96d9-8f1c7426bc7a',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6a999cfd-50a2-4568-949f-676a779f26ab',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '7c415dd6-f3be-4b20-9684-d7bb9ddd18c7',
      fieldMetadataUniversalIdentifier: DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '4dd2f05c-2c85-49b7-b470-c2dd7d9c732f',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8da4ce4d-5475-4ff9-a0e1-f310d9c4f860',
      fieldMetadataUniversalIdentifier:
        GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '6ec44a31-a4a1-4676-a228-4dcd5b1b5b35',
      fieldMetadataUniversalIdentifier:
        GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'b4f1f7ca-cb81-4cae-b7cd-739eb520af22',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 220,
    },
  ],
});
