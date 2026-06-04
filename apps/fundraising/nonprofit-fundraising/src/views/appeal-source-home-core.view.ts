import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-appeal-source.field';
import { FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-company-on-appeal-source.field';
import { FUNDRAISER_PERSON_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-person-on-appeal-source.field';
import {
  APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal-source.object';

export const APPEAL_SOURCE_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '46edc770-0efa-464f-b8a3-c4c8eead8f1a';

const APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '395f406e-78b0-4f6a-a841-9622505a7d90';

export default defineView({
  universalIdentifier: APPEAL_SOURCE_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal source home core fields',
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Home core fields',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'f8eccde5-3ec0-4fdf-9066-d2ea574b97ad',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'f58f7903-8ba9-4a51-aaaf-0567b7a1ce21',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '9fbb8da7-e1cb-460d-bb6d-af534bf1fb1c',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '252ffab0-d6cc-452c-ad61-b0aab2cb47f2',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '510ee841-1fff-42bd-b717-698da14e0f06',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4ad547aa-0470-4ce3-a88f-4087133737c8',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'ac6381c1-4ec2-4776-8f7a-c81fb6fd89d7',
      fieldMetadataUniversalIdentifier:
        FUNDRAISER_PERSON_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'adfe5b18-372c-41a9-af66-af32b62e03bb',
      fieldMetadataUniversalIdentifier:
        FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5e414d71-dfe7-4a6a-9ef9-8981e7fa8e39',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 280,
    },
  ],
});
