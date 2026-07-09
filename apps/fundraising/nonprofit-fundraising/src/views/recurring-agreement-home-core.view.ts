import {
  defineView,
  generateDefaultFieldUniversalIdentifier,
} from 'twenty-sdk/define';
import { APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-recurring-agreement.field';
import { APPEAL_SOURCE_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-source-on-recurring-agreement.field';
import { FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-recurring-agreement.field';
import { PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-recurring-agreement.field';
import {
  RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_INTERVAL_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_MANDATE_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_PROVIDER_PAYMENT_METHOD_ID_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/recurring-agreement.object';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const RECURRING_AGREEMENT_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '3bf36d70-cc2d-4e58-9969-23d4d3e18696';

const RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'c520779d-b970-4192-bc76-359ae15f3ec9';
const RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'a7a8480f-76b7-4c24-b31c-18ca74edde6c';
const RECURRING_AGREEMENT_HOME_GIFT_CODING_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '51f51ef1-de29-4193-a36c-2836193fb08e';
const RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '29e00eb4-6c83-46f3-8e4f-4fc1fa7b642b';

const systemFieldUniversalIdentifier = (fieldName: string) =>
  generateDefaultFieldUniversalIdentifier({
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
    fieldName,
  });

export default defineView({
  universalIdentifier: RECURRING_AGREEMENT_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Recurring agreement home core fields',
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Agreement',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Payment',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_HOME_GIFT_CODING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Gift coding',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'System',
      position: 3,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '8f1b8b00-1f11-43b0-845e-9f0c1122a5aa',
      fieldMetadataUniversalIdentifier:
        PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '94e982e8-b5ac-4927-8f5c-ac1d20919a4e',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '1688f4d1-7e96-4af3-bcf6-f62b90eb60ba',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '434af0c6-ce21-4cce-a8f6-5838faf02057',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_INTERVAL_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'd2d293a4-2d62-4d4f-8b93-027a712b15f7',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '87bb66c8-7c95-4bf4-a021-5599b139266e',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'd3475e02-11c1-47d3-a21d-77595ad75260',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_AGREEMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '39d7e600-1319-4df4-8ab6-975ae0cbc23a',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '2f41921e-52e9-4c8b-909f-aca0254c07d2',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 170,
    },
    {
      universalIdentifier: 'd15a5819-94b7-4a9c-a32d-e46823c2270a',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'dea4c362-c4e6-4f2f-8c85-ca9998b66f09',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '084b12d3-2aea-463d-a479-70bd5067a229',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_PAYMENT_METHOD_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '96662375-c86d-4e8c-acf2-c121fa61ca46',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_MANDATE_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_PAYMENT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7ecb773e-905f-4240-8221-647a54616b4e',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_GIFT_CODING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'fe4a8b9c-fda8-4d7e-9406-ba1f77ff8945',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_GIFT_CODING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7ac6d552-8a87-4fbd-9cad-e43c64b9589a',
      fieldMetadataUniversalIdentifier:
        FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_GIFT_CODING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'aa75f614-b515-4176-8e62-4c636df85731',
      fieldMetadataUniversalIdentifier: systemFieldUniversalIdentifier('createdAt'),
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'e7e4125b-17df-4f6d-b1d5-d86b658b7d00',
      fieldMetadataUniversalIdentifier: systemFieldUniversalIdentifier('updatedAt'),
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'cd3d0dff-0949-4a39-8425-64b6dc866fb0',
      fieldMetadataUniversalIdentifier: systemFieldUniversalIdentifier('createdBy'),
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4a2f13cf-8279-4df5-8c81-c3c8960c8a0a',
      fieldMetadataUniversalIdentifier: systemFieldUniversalIdentifier('updatedBy'),
      viewFieldGroupUniversalIdentifier:
        RECURRING_AGREEMENT_HOME_SYSTEM_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
  ],
});
