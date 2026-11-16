import { defineView } from 'twenty-sdk/define';
import {
  APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'ea9f21ee-b677-4882-aa42-f4e1a28966be';
const APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '97f3d5bf-eabf-47c3-ad38-1397209d98ac';
const APPEAL_DETAILS_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'f5028158-f119-4da6-9efe-f630202c5fc0';

export default defineView({
  universalIdentifier: APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal details fields',
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Appeal',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Performance',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        APPEAL_DETAILS_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Reference',
      position: 2,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'd4a8cfba-4adf-4d7e-99cf-eb8722aeffbe',
      fieldMetadataUniversalIdentifier: APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8c6f945d-2d7c-4f92-a8d1-1782cc7cdbe4',
      fieldMetadataUniversalIdentifier: APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '634ab281-e218-4758-b957-50c6894a95d4',
      fieldMetadataUniversalIdentifier: APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'bde7c6ab-ef0c-4a1c-a83e-a460f11a2cdb',
      fieldMetadataUniversalIdentifier:
        DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e3eb0ad1-f721-497d-b07d-b13dc1c0897a',
      fieldMetadataUniversalIdentifier:
        APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '9f1fdac5-c0fc-44b4-a11b-ee22f46e7edf',
      fieldMetadataUniversalIdentifier:
        APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_APPEAL_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '7303fd7c-d1e5-43ca-8d33-5146c8334d87',
      fieldMetadataUniversalIdentifier:
        APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '1854b6b9-c90c-4a4f-bdf1-31c22b029e25',
      fieldMetadataUniversalIdentifier:
        APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '46f56c97-8eb4-42a7-b081-ed0922e99f4f',
      fieldMetadataUniversalIdentifier:
        APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '02cdd9f4-61e5-43e7-863d-dfb024ca17a8',
      fieldMetadataUniversalIdentifier:
        APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'a514b019-57ce-4235-a58b-670939836b45',
      fieldMetadataUniversalIdentifier:
        APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '913d2bed-9f8a-43d1-82c3-e3d5324bbf1c',
      fieldMetadataUniversalIdentifier:
        APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_PERFORMANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e82f1d09-2546-4c68-a05a-dfe95f348a78',
      fieldMetadataUniversalIdentifier:
        APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '466e4e8a-612c-48ef-b3b2-dfe91826770b',
      fieldMetadataUniversalIdentifier:
        APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_DETAILS_REFERENCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 320,
    },
  ],
});
