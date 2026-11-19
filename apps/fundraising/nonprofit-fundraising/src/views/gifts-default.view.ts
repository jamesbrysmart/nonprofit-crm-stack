import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gifts',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconGift',
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: 'a34f3f52-6a4e-4526-9dc7-48c6f4b186b0',
      fieldMetadataUniversalIdentifier: GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd526138e-c73e-4fdf-9b34-82a5d06cf8b5',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4c800c3c-91d6-4c0a-b4e2-4143693170f5',
      fieldMetadataUniversalIdentifier:
        GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1.5,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: '51452011-fbac-4b4d-a357-44ddbb20db8a',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '8bd50d4c-49ef-4ce7-8c4e-894a7fcd6172',
      fieldMetadataUniversalIdentifier: DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3c1d66c1-447d-4090-a22c-b7d341779412',
      fieldMetadataUniversalIdentifier:
        COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '18ec5bd8-f34a-4d02-a8a0-26a6629724c8',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'f219aefc-7f6e-449b-95b2-7b6397607da8',
      fieldMetadataUniversalIdentifier: FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '533e422f-43f4-43e9-868b-d60b9ce12a20',
      fieldMetadataUniversalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '7fd4f7de-1d60-4e40-abf4-5934cc9c9042',
      fieldMetadataUniversalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'ac9c8c8d-84d5-4d51-b533-fdc66fe4c07b',
      fieldMetadataUniversalIdentifier:
        GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 220,
    },
  ],
});
