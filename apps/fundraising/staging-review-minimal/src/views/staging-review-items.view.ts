import { defineView, ViewKey } from 'twenty-sdk';
import {
  STAGING_REVIEW_ITEM_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
  STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/objects/staging-review-item.object';
import { DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-staging-review-item.field';

export const STAGING_REVIEW_ITEMS_VIEW_UNIVERSAL_IDENTIFIER =
  'e7069940-784d-4cea-bf3d-dd60e482b4a1';

export default defineView({
  universalIdentifier: STAGING_REVIEW_ITEMS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Staging review queue',
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  icon: 'IconInbox',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'a8db694e-77eb-4b5d-91dc-aef8ff691566',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7af12f2c-b2d5-4e10-9d55-b538bd38317c',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '9eb7272e-2ee9-4c47-8ac3-7dd5d385c31a',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '8b32c56d-f6e4-4ce9-aee0-5b1f16256df8',
      fieldMetadataUniversalIdentifier:
        DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '6b9d944e-c7c2-4653-8c7d-447f0517a06d',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '880616d3-b502-4ae5-9b31-5dd271267f5e',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7e4409b1-ec31-419d-986d-e4397af1881a',
      fieldMetadataUniversalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
  ],
});
