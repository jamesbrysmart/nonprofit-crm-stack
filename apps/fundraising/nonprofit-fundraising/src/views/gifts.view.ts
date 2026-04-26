import { defineView, ViewKey } from 'twenty-sdk/define';
import { DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-gift.field';
import {
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift.object';

export const GIFTS_VIEW_UNIVERSAL_IDENTIFIER =
  '40a54cb6-9c6b-4664-94ff-4cc98f37e627';

export default defineView({
  universalIdentifier: GIFTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gifts',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconGift',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'cb3fe2fd-0971-4901-bfb4-af72d6e4088e',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '584ccb18-8904-4cba-a998-a24a2930db9b',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '798d1dbb-688f-41ef-aa94-4f6bf95e3e0b',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '43b3c5f1-64c4-4537-8cfa-331f273fb423',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '1fc70260-a73d-485e-b593-3a9572ff2d3f',
      fieldMetadataUniversalIdentifier: DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd7be152d-91d9-4c76-97fd-90fab0f79d33',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'eb09d476-b46c-4151-8a78-9d286185192f',
      fieldMetadataUniversalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'e3ff7781-2f21-478e-9403-913f12d221ce',
      fieldMetadataUniversalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '21f66cc0-bbe1-4f35-8de9-34a69f959b38',
      fieldMetadataUniversalIdentifier:
        GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 220,
    },
  ],
});
