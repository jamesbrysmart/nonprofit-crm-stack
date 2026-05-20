import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-gift-staging.field';
import { FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-gift-staging.field';
import {
  GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';

export const GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '4e423083-6e33-44d8-ab07-5333d8bbfe80';

const CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '895baed6-0ce5-4326-b550-b2404310a7ec';

export default defineView({
  universalIdentifier: GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift staging review core fields',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconChecklist',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier: CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Core review fields',
      position: 0,
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
      universalIdentifier: '1bb240c1-a3ef-4963-b750-dd69bcfe8c81',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '4ad7ef41-ed9f-4ee3-92bf-d17a4f90d6de',
      fieldMetadataUniversalIdentifier:
        FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CORE_REVIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
  ],
});
