import { defineView } from 'twenty-sdk/define';
import { DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-on-appeal.field';
import {
  APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal.object';

export const APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  'fd8dfa4b-3df9-4761-b34f-45a36d7d3669';

const APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'ea9f21ee-b677-4882-aa42-f4e1a28966be';

export default defineView({
  universalIdentifier: APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal details fields',
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Appeal details',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'd4a8cfba-4adf-4d7e-99cf-eb8722aeffbe',
      fieldMetadataUniversalIdentifier: APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8c6f945d-2d7c-4f92-a8d1-1782cc7cdbe4',
      fieldMetadataUniversalIdentifier: APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '634ab281-e218-4758-b957-50c6894a95d4',
      fieldMetadataUniversalIdentifier: APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'bde7c6ab-ef0c-4a1c-a83e-a460f11a2cdb',
      fieldMetadataUniversalIdentifier:
        DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e3eb0ad1-f721-497d-b07d-b13dc1c0897a',
      fieldMetadataUniversalIdentifier:
        APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '9f1fdac5-c0fc-44b4-a11b-ee22f46e7edf',
      fieldMetadataUniversalIdentifier:
        APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '7303fd7c-d1e5-43ca-8d33-5146c8334d87',
      fieldMetadataUniversalIdentifier:
        APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1854b6b9-c90c-4a4f-bdf1-31c22b029e25',
      fieldMetadataUniversalIdentifier:
        APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e82f1d09-2546-4c68-a05a-dfe95f348a78',
      fieldMetadataUniversalIdentifier:
        APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '466e4e8a-612c-48ef-b3b2-dfe91826770b',
      fieldMetadataUniversalIdentifier:
        APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 9,
      isVisible: true,
      size: 320,
    },
    {
      universalIdentifier: '7379a437-57e4-4bf5-a6c9-a985653a34e6',
      fieldMetadataUniversalIdentifier: APPEAL_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 10,
      isVisible: true,
      size: 280,
    },
  ],
});
