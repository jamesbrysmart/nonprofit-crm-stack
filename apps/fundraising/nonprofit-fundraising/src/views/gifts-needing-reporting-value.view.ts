import { defineView, ViewFilterOperand } from 'twenty-sdk/define';
import {
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFTS_NEEDING_REPORTING_VALUE_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Worklist of gifts that are not yet in fundraising totals because they have
// no value in the reporting currency. Enter the Reporting amount to resolve one.
export default defineView({
  universalIdentifier: GIFTS_NEEDING_REPORTING_VALUE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Needs reporting value',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconCoins',
  position: 2,
  filters: [
    {
      universalIdentifier: '15a04ad9-c644-4651-8a70-183e23087a67',
      fieldMetadataUniversalIdentifier:
        GIFT_REPORTING_AMOUNT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['MISSING']),
    },
  ],
  fields: [
    {
      universalIdentifier: '3748a1de-36d0-4dbc-835b-4283c1f17af0',
      fieldMetadataUniversalIdentifier: GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '115abc9f-5cf4-4431-8faa-771ddf83cc07',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ea36265c-77f9-4eb2-8bc5-5222092ea5e9',
      fieldMetadataUniversalIdentifier: GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: '98712cac-5df4-4b6e-bd37-5e0633b7e699',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '390d140b-a814-4d50-8416-96ff2235d8e9',
      fieldMetadataUniversalIdentifier: DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '399df705-d9d9-40dc-a530-a4956ce20c1d',
      fieldMetadataUniversalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7da5a8bb-d0d4-4328-ab6e-5be72119147e',
      fieldMetadataUniversalIdentifier: GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 170,
    },
  ],
});
