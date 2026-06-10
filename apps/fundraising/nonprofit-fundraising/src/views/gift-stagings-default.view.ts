import { defineView, ViewFilterOperand, ViewKey } from 'twenty-sdk/define';
import { DONOR_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-gift-staging.field';
import {
  GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';

export const GIFT_STAGINGS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER =
  '8616460f-b4b2-4d23-a83b-cc6fc4c4fc8f';

export default defineView({
  universalIdentifier: GIFT_STAGINGS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift staging queue',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconInbox',
  key: ViewKey.INDEX,
  position: 1,
  filters: [
    {
      universalIdentifier: '8c9c8e4c-1f4f-41e2-beb4-6f744574b9b2',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS_NOT,
      value: JSON.stringify(['PROCESSED']),
    },
  ],
  fields: [
    {
      universalIdentifier: '1f8f95a9-e1e0-4ca0-bfcb-b6832bbf31aa',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3f163348-52be-4fcd-a315-8ba3d92d3aba',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '8daff0f3-78d4-45b0-a44a-f33e99604db0',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a349fa92-58a6-4635-89d4-08b0db601a59',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '67feeff5-8691-4949-bfdd-641ca806b0cb',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '68d54a58-4d17-4254-9495-8d15ce6417c0',
      fieldMetadataUniversalIdentifier:
        DONOR_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5c84b58b-2cc7-4368-92b9-e8918b38424b',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5c44cb8e-5cb3-4b0a-a8a9-85223490a55f',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '367f5ee4-6766-4060-9cbe-976908f95ee9',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '7fbba2dc-9201-46e9-9eb2-b6cc99d06d2f',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '31903a7a-24dd-4a82-9a5e-c3ca69c45f3e',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e2f0753b-cfe9-4f45-b0b2-0f0108e79f78',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 12,
      isVisible: true,
      size: 240,
    },
  ],
});
