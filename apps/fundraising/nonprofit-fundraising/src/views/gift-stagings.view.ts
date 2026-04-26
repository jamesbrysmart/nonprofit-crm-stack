import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';
import { DONOR_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-gift-staging.field';

export const GIFT_STAGINGS_VIEW_UNIVERSAL_IDENTIFIER =
  '73a987ab-a9a8-4e78-a9e5-1f2c1fba4e41';

export default defineView({
  universalIdentifier: GIFT_STAGINGS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift staging queue',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconInbox',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '8a788f5f-79f2-47c2-9c72-9144f6339bd5',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '160ce8a9-dcab-4ae7-b0af-ef5f333ba005',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5fe84d17-6cbe-4866-b7bf-c4e252d6ade2',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1e1d8eb8-aae2-4dc0-b070-e32a3dffb289',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '8e5f1269-5048-4eeb-a7fa-cf484f75e0af',
      fieldMetadataUniversalIdentifier:
        DONOR_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9835c57f-cb06-4d89-a51f-fd6fd97f4c30',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '85cf69d3-77a7-4a28-8e39-53a83ad0f317',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e214961b-bd45-42f6-ba43-447efc671797',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9bc2640c-e5fe-4fc7-9503-1d903eab4d8d',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'eb66051f-b7f8-4e3e-88fb-a16a41d39ea1',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '4d37e45e-fb58-4a5d-bfdb-6ed9ae95c7f0',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '68e598d0-e112-4277-93d3-9f5c34b7dcab',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
      size: 240,
    },
  ],
});
