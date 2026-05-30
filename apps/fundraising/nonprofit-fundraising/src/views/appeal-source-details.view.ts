import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-appeal-source.field';
import {
  APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_URL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal-source.object';

export const APPEAL_SOURCE_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  'dc5b422d-17a8-4f47-8e8d-1ed4c7ff754c';

const APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '04f7456d-1f45-49f3-b884-4b46be0db564';

export default defineView({
  universalIdentifier: APPEAL_SOURCE_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal source details fields',
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Appeal source details',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'cfde1d8c-cb9b-4f59-a6ba-6d6c366d76ef',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'b66ff70b-ebc2-4f35-a0f5-cffbd2175648',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '226cb9c1-c6e7-4f2d-a954-b92ebd968f1c',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '5f5e8f00-e677-49a1-8503-d252c1399fd7',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '2892f9fe-8fb5-4cc1-901f-0ac0a83bd850',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '9215ee74-34f8-4251-b4ff-a51d6d5d13a3',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '35ecfe55-5955-4f8b-913b-7646c11d8f4b',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'b1fcb3f9-b398-4b88-b291-2413e9a21583',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5a42c7f6-2755-4948-948f-4bd4bb426caa',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '7d0e866d-1abd-4f85-a40b-9177fa99562c',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_URL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '79b2a9cd-8da3-4a92-a672-1d176bc23598',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: 'be028b29-228a-4142-8732-5f41a98d230c',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_SOURCE_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 11,
      isVisible: true,
      size: 320,
    },
  ],
});
