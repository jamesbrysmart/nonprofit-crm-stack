import { defineView, ViewKey } from 'twenty-sdk';
import { GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-on-gift-staging.field';
import {
  GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';

export const GIFT_STAGING_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  'c5d27968-8ee1-4eb5-a32d-f606dfb305d4';

export default defineView({
  universalIdentifier: GIFT_STAGING_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Staging',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconInbox',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'fd340d0b-fd56-426f-9035-e7be2ed33656',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '8d8cccd8-a27d-42de-8f8b-444d1874c210',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a8b805ff-c083-4c10-800f-1e3811d59abf',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '5419ddbe-ed90-4c58-9c1f-eef12f3f20ad',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4c1079bf-6d54-4fba-9549-d9d4e4a3a7e3',
      fieldMetadataUniversalIdentifier:
        GIFT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '9d216a6b-c993-4958-a7b5-5b1e0e77db90',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 300,
    },
  ],
});
