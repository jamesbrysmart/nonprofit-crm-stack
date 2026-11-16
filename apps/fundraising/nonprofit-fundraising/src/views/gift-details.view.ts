import { defineView } from 'twenty-sdk/define';
import {
  APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_COVERED_FEE_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_IS_ANONYMOUS_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_NET_RECEIVED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROCESSING_FEE_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_SOFT_CREDIT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'e4855655-fe3c-4ab2-ac92-5507f6f2c219';
const GIFT_DETAILS_DONOR_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'b43da4ce-43cb-418f-a506-2c408f2a3126';
const GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'f29f8472-15cd-4579-9317-93949ecb7fdb';
const GIFT_DETAILS_PAYMENT_SOURCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'dcb11fcb-e7d6-41d2-9fc4-ddf198c9e943';
const GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'ba1987da-1533-418c-b141-96ba8e0be615';

export default defineView({
  universalIdentifier: GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift details fields',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Gift',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: GIFT_DETAILS_DONOR_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Donor',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Fundraising context',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_DETAILS_PAYMENT_SOURCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Payment source',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Payment amounts',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'c21f7adf-7b44-4a54-9ca9-c1f7d7cba76d',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3be83196-b725-46d8-a72f-ef20d969c544',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '7b563c7e-d613-4917-a0e2-cfc8dc9ee9e1',
      fieldMetadataUniversalIdentifier: GIFT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a5815598-f107-4e03-a87b-e5ba837c593d',
      fieldMetadataUniversalIdentifier:
        GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: 'f8569515-af28-4dcf-8d39-0d15075a4efd',
      fieldMetadataUniversalIdentifier:
        GIFT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_GIFT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 320,
    },
    {
      universalIdentifier: '4d6b360a-652f-41c8-9e7c-16187fa10e30',
      fieldMetadataUniversalIdentifier:
        DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_DONOR_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5fce33a4-4f46-4678-804a-7d673c77e9b1',
      fieldMetadataUniversalIdentifier:
        COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_DONOR_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3a2cc4fc-052b-48c5-9b8b-76896944d94e',
      fieldMetadataUniversalIdentifier:
        GIFT_IS_ANONYMOUS_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_DONOR_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'df1bbd5d-bfe5-431c-9ef1-2a26780ddf1b',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'cb8d57e5-f638-432a-9b78-a900efc1bc8d',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '556a352d-53df-46d0-bfd1-d8346ad07bd4',
      fieldMetadataUniversalIdentifier: FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a4a648c3-e541-4b5e-b71d-cf207d1455f3',
      fieldMetadataUniversalIdentifier:
        OPPORTUNITY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7f0cb363-ac9a-4258-8917-ae07fc9ab4aa',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd166680f-f067-4999-ab69-89ddacbe5342',
      fieldMetadataUniversalIdentifier:
        GIFT_SOFT_CREDIT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd7502c7d-34df-45e0-a1ca-d33ff00679d0',
      fieldMetadataUniversalIdentifier:
        SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'fd2a38dd-7807-4db6-b8b8-d13e999ae444',
      fieldMetadataUniversalIdentifier:
        SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'dfce22a2-cd40-4d25-b3ff-117ff5eb7f31',
      fieldMetadataUniversalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_SOURCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '2ac133a0-8cbf-4a1e-98d8-b31fe7178ab3',
      fieldMetadataUniversalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_SOURCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a6b86501-ac9c-4f0d-9dd3-f97eae443ad4',
      fieldMetadataUniversalIdentifier:
        GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_SOURCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5ab47bc0-8e51-459c-a041-02bc1baf9550',
      fieldMetadataUniversalIdentifier:
        GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4c03c4e9-1f69-4181-b627-4382eb6d2444',
      fieldMetadataUniversalIdentifier:
        GIFT_COVERED_FEE_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'a181cd0d-383f-46fb-a4aa-c0b1813b9c53',
      fieldMetadataUniversalIdentifier:
        GIFT_PROCESSING_FEE_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e4fc46f1-6c04-4c83-af40-5c09c2952d7a',
      fieldMetadataUniversalIdentifier:
        GIFT_NET_RECEIVED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_DETAILS_PAYMENT_AMOUNTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
  ],
});
