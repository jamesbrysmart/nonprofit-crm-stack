import { defineView, ViewKey } from 'twenty-sdk/define';
import { APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-appeal-source.field';
import {
  APPEAL_SOURCE_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal-source.object';

export const APPEAL_SOURCES_VIEW_UNIVERSAL_IDENTIFIER =
  '5acfe84d-b4b7-4a7b-afee-77f883f71927';

export default defineView({
  universalIdentifier: APPEAL_SOURCES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal sources',
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconRoute2',
  key: ViewKey.INDEX,
  position: 2,
  fields: [
    {
      universalIdentifier: '7fe453f4-7f23-43ce-8a2d-652deaa96fd5',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '5a34353d-646f-44bc-9a74-75952d860cab',
      fieldMetadataUniversalIdentifier:
        APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'ea46b35f-dbbf-4624-a68c-7278dbdca733',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'eb97d00e-8928-4b74-ae4c-a383fa3dbe19',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '53eb056a-71fd-4499-9c6e-602ad9e50675',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '960b9f76-c14d-4d90-8340-abdddcaf2144',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5ea8352e-d5b3-4b57-ab48-dcfc771126df',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3e593764-a321-4797-87ad-82463b9702b8',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '2167e183-3ca7-4006-be72-f9e2a543c184',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'ca12ddea-6754-4cde-bbf0-3f2fef43cf38',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '26c330af-d6b1-42ea-a247-77082a659d9c',
      fieldMetadataUniversalIdentifier:
        APPEAL_SOURCE_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 160,
    },
  ],
});
