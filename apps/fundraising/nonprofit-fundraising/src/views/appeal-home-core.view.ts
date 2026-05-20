import { defineView } from 'twenty-sdk/define';
import { DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-on-appeal.field';
import {
  APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal.object';

export const APPEAL_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '50ea8152-e156-4ba1-92e5-d5f2d9aa4b7d';

const APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '552b18dc-ac39-4d0a-9340-5f6439aeaf38';

export default defineView({
  universalIdentifier: APPEAL_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeal home core fields',
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier: APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Home core fields',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'ab2397fb-14d1-45f7-a5f7-2424c91ce567',
      fieldMetadataUniversalIdentifier: APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '38f5a390-e524-4c85-bd6c-b8d7ff788d72',
      fieldMetadataUniversalIdentifier: APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'c73dbbee-97fb-45f2-86e2-cfca992fbb6f',
      fieldMetadataUniversalIdentifier:
        DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '2c605adf-b54d-4aa8-8c4e-1c7fc4f3cedd',
      fieldMetadataUniversalIdentifier:
        APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f76cbb09-7e05-4d40-a1f6-3958c7dde2b7',
      fieldMetadataUniversalIdentifier:
        APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '04638328-f2dd-4331-bb6a-64a37ca8ad99',
      fieldMetadataUniversalIdentifier:
        APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'a7302196-732c-4aea-a6f6-f4b7dc8796e0',
      fieldMetadataUniversalIdentifier:
        APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '4ed58617-7f31-44cc-96be-ef461aac7d2c',
      fieldMetadataUniversalIdentifier:
        APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        APPEAL_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 140,
    },
  ],
});
