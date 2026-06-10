import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-gift-staging.field';
import { APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-source-on-gift-staging.field';
import { FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-gift-staging.field';
import {
  GIFT_STAGING_APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_MAILING_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_PHONE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_READY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_IS_ANONYMOUS_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PAYMENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_SOFT_CREDIT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_SOURCE_APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_SOURCE_FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_SUPPORTER_EMAIL_OPT_OUT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';

export const GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '4e423083-6e33-44d8-ab07-5333d8bbfe80';

const CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '895baed6-0ce5-4326-b550-b2404310a7ec';
const ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '2f2df78a-168f-4a6c-bbbb-c28f7bd8c3f7';
const DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '9bd5052f-2155-4430-9f86-b412de7f7d1a';
const PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '413f057f-3316-40de-b68e-43a964d8d164';
const PROVIDER_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '6c376f9e-7100-463c-a63d-f15ee0e35ba5';

export default defineView({
  universalIdentifier: GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift staging review core fields',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconChecklist',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier: CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Gift details',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Attribution',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Donor evidence',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Processing state',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: PROVIDER_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Provider references',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'f81c46a6-3284-451c-9bba-7dd51f73988b',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c2f8672e-c2e2-4049-85b2-4aadcb3bf9c4',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '5091df03-7478-48f3-8e7e-bf86fb627cf1',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '6db7b7e7-9c50-4f39-b4c5-410eb2577611',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONATION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4a9681d1-46e5-4c9d-8a4b-ffcb26a7e343',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '1bb240c1-a3ef-4963-b750-dd69bcfe8c81',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '4ad7ef41-ed9f-4ee3-92bf-d17a4f90d6de',
      fieldMetadataUniversalIdentifier:
        FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '326889fe-c819-437a-a861-b56758ec0b31',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a75bc76f-641e-41ea-89f5-a70fd2d093a9',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_SOURCE_APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9d42a2c7-542b-47fe-8a6b-17ee07dd9769',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_SOURCE_FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '04a30324-4b9b-4243-8126-b873485d73c2',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        ATTRIBUTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '6a69b779-821e-4df4-83d8-035f4afaf20d',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '3d361eff-b5c9-460c-9056-5d086663236b',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '1006a3f0-4c25-4ebc-82b9-739a6979f446',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'ce8a30e9-2780-4359-afcc-01f15090be5c',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_PHONE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'fbb9c1e6-020e-4621-b885-d654af1f0f42',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_MAILING_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '8657dd0e-80e8-4d77-9446-56d33bc96462',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_IS_ANONYMOUS_DONOR_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '93ef8bdc-350b-4a01-8919-3c457ff4c8fe',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_SUPPORTER_EMAIL_OPT_OUT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '03241346-4ef0-4fbc-a3f4-d80cc32586d4',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_SOFT_CREDIT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        DONOR_EVIDENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '57b36c3c-12cd-4814-afbc-9b06b890bb06',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '22372679-d412-44d3-a186-c56645ae9bcb',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_GIFT_READY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'e951f670-3526-4970-baa6-489154b7165c',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '05dfc8ea-5167-4210-a0fe-d6189bb87a56',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PAYMENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '507b21ca-6e90-406f-b5a7-d9d01b93147a',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROCESSING_STATE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 320,
    },
    {
      universalIdentifier: '62346a3c-5a6f-49fb-8862-71ca60f6ddcc',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROVIDER_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '834b67c9-5d5f-4d78-b2d2-e40fae223eb7',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROVIDER_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'af8a9cb0-a2b8-493c-afc7-9ef0b455e46c',
      fieldMetadataUniversalIdentifier:
        GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PROVIDER_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
  ],
});
