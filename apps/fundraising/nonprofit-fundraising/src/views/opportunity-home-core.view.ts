import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/application-deadline-on-opportunity.field';
import { AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/awarded-amount-on-opportunity.field';
import { FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/funding-period-end-on-opportunity.field';
import { FUNDING_PERIOD_START_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/funding-period-start-on-opportunity.field';
import { FUNDING_TYPE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/funding-type-on-opportunity.field';
import { SUBMITTED_DATE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/submitted-date-on-opportunity.field';

export const OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '7e4252cc-8dae-41ab-9f1a-8e92d90bddde';

const OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '7dfb2e35-1210-42ea-8014-1a5f85834e0f';
const OPPORTUNITY_HOME_CORE_APPLICATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '554e3283-0d59-460c-a29e-2498b08e0247';
const OPPORTUNITY_HOME_CORE_AWARD_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '52ca2215-430a-4f90-befe-6dcdbecf3225';

export default defineView({
  universalIdentifier: OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Opportunity home core fields',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Context',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier:
        OPPORTUNITY_HOME_CORE_APPLICATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Application',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        OPPORTUNITY_HOME_CORE_AWARD_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Award',
      position: 2,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '27d9c963-41e1-4596-bcef-2343d2dd0313',
      fieldMetadataUniversalIdentifier:
        FUNDING_TYPE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'e4ff2db1-6e45-42f5-b02d-344ce76ee6cc',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.stage
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '10d817df-af15-4077-8a7d-4aee83126c12',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.company
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '95c5115b-03f5-4b91-bca3-bc205306967b',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.pointOfContact
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c8b622f5-2baf-4aeb-b940-e321a77b00cb',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.owner
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '85d837a0-4af5-4d1c-ab50-9df7ff9711e2',
      fieldMetadataUniversalIdentifier:
        APPLICATION_DEADLINE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_APPLICATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '81751e4e-f6ce-48ef-b7ff-04dc43f14546',
      fieldMetadataUniversalIdentifier:
        SUBMITTED_DATE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_APPLICATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'b3a54ea8-3cd8-4df6-a113-f35c7b26cf95',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.amount
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_APPLICATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5dbe6274-d170-4892-bc34-b377b4805ec9',
      fieldMetadataUniversalIdentifier:
        AWARDED_AMOUNT_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_AWARD_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e57d7233-e694-4ca6-a2c5-1c7dbb55f8e8',
      fieldMetadataUniversalIdentifier:
        FUNDING_PERIOD_START_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_AWARD_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd2e37df5-5a5a-48b5-87cf-a7b947548903',
      fieldMetadataUniversalIdentifier:
        FUNDING_PERIOD_END_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        OPPORTUNITY_HOME_CORE_AWARD_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
  ],
});
