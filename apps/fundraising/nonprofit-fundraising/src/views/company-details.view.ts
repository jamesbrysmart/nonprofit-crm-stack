import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineView,
} from 'twenty-sdk/define';
import { AWARDED_OPPORTUNITY_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/awarded-opportunity-amount-on-company.field';
import { AWARDED_OPPORTUNITY_COUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/awarded-opportunity-count-on-company.field';
import { LAST_GIFT_DATE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/last-gift-date-on-company.field';
import { LIFETIME_GIFT_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/lifetime-gift-amount-on-company.field';
import { NEXT_APPLICATION_DEADLINE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/next-application-deadline-on-company.field';
import { NEXT_FUNDING_PERIOD_END_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/next-funding-period-end-on-company.field';

export const COMPANY_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  'fbe24723-0174-4f16-b759-8de343f957c3';

const ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'c446e2c1-f7a6-48e4-a0f6-bb9e99a808aa';
const FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'a71f779a-c292-4811-9724-e1ef0eb0267c';

export default defineView({
  universalIdentifier: COMPANY_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Company details fields',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Organisation details',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Funding summary',
      position: 1,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '6c17cb70-7fe7-4619-9eb4-c782971d6db1',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.name
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '5c988fc1-cdc4-4a64-9b65-fbb9b072f198',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.domainName
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd1dcd692-d78e-48b6-b92a-dd1125ced455',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.address
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: 'f92c98b6-338e-4403-a4a1-182a1749953a',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.linkedinLink
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'ebbc4cd1-cb9c-47b7-8d68-a3486fcfbbfe',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.accountOwner
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'f2d01933-1280-4462-baf5-07a5e6d22b4c',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.annualRevenue
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        ORGANISATION_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'dd27074f-cc4b-4a68-ab88-4c78d227ee56',
      fieldMetadataUniversalIdentifier:
        LIFETIME_GIFT_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c7e45ed4-52a7-4398-968e-9ae1d7fb31c4',
      fieldMetadataUniversalIdentifier:
        LAST_GIFT_DATE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'ddfbb894-5719-4be3-a481-cde4972607b3',
      fieldMetadataUniversalIdentifier:
        AWARDED_OPPORTUNITY_AMOUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'b30f5a77-e03f-4352-aa25-e3d070860720',
      fieldMetadataUniversalIdentifier:
        AWARDED_OPPORTUNITY_COUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '27a68c56-103c-4ac5-9bc7-6d7a7c8cbf54',
      fieldMetadataUniversalIdentifier:
        NEXT_APPLICATION_DEADLINE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd4ff5e49-87b6-46e9-b3f1-6b7a728c4799',
      fieldMetadataUniversalIdentifier:
        NEXT_FUNDING_PERIOD_END_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUNDING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
});
