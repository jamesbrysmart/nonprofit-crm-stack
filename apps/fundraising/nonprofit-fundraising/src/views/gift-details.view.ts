import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-gift.field';
import { APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-source-on-gift.field';
import { FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-gift.field';
import { OPPORTUNITY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/opportunity-on-gift.field';
import { RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreement-on-gift.field';
import {
  GIFT_COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift.object';

export const GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  'a8c3c620-a376-4894-a9aa-b713ab7776a0';

const GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'e4855655-fe3c-4ab2-ac92-5507f6f2c219';

export default defineView({
  universalIdentifier: GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift details fields',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Gift details',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'b76b5401-2501-45df-aad2-c81be6665c8a',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '17a1d98a-b5e1-4fe2-a14e-ed2451f7b52f',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd919bbd9-1f63-4075-b57b-4e298e184b8a',
      fieldMetadataUniversalIdentifier:
        GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3e3fcebb-f0a1-47b3-bb8a-ee2db7286fe9',
      fieldMetadataUniversalIdentifier:
        GIFT_COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'cb8d57e5-f638-432a-9b78-a900efc1bc8d',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '556a352d-53df-46d0-bfd1-d8346ad07bd4',
      fieldMetadataUniversalIdentifier: FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'df1bbd5d-bfe5-431c-9ef1-2a26780ddf1b',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a4a648c3-e541-4b5e-b71d-cf207d1455f3',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7f0cb363-ac9a-4258-8917-ae07fc9ab4aa',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'dfce22a2-cd40-4d25-b3ff-117ff5eb7f31',
      fieldMetadataUniversalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '2ac133a0-8cbf-4a1e-98d8-b31fe7178ab3',
      fieldMetadataUniversalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a6b86501-ac9c-4f0d-9dd3-f97eae443ad4',
      fieldMetadataUniversalIdentifier:
        GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
      size: 220,
    },
  ],
});
