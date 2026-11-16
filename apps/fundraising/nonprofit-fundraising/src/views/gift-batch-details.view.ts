import { defineView } from 'twenty-sdk/define';
import {
  DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_EXPECTED_ITEM_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_EXPECTED_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const GIFT_BATCH_DETAILS_BATCH_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'fd6c12d1-fab8-4f19-83d6-e315aa21848c';
const GIFT_BATCH_DETAILS_RECONCILIATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'a9302915-6f88-4d47-858c-f7ccedc7bc9c';
const GIFT_BATCH_DETAILS_PROCESSING_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '5f6fe214-ff3b-4dd8-8f33-cb3a4e7c65f6';
const GIFT_BATCH_DETAILS_CODING_DEFAULTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '66cc6f5a-0cd7-4e2c-9f5b-10e159b4a2d7';

export default defineView({
  universalIdentifier: GIFT_BATCH_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift batch details fields',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier:
        GIFT_BATCH_DETAILS_BATCH_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Batch',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_BATCH_DETAILS_RECONCILIATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Reconciliation',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_BATCH_DETAILS_PROCESSING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Processing result',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier:
        GIFT_BATCH_DETAILS_CODING_DEFAULTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Coding defaults',
      position: 3,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'f8ff1088-ff56-46cb-adc7-6fa7bd7646e5',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_BATCH_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e28a06b6-c117-46c1-b73b-107529da748d',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_BATCH_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a603b5ba-1634-43ea-b527-4617f0d71e01',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_BATCH_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '356d40fd-66b0-4d5d-9dd6-fdc741f982ce',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_EXPECTED_ITEM_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_RECONCILIATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'fb8e531c-34ba-4d6d-a739-312703108f20',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_EXPECTED_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_RECONCILIATION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c6b7a050-0695-43e2-b0c5-02f7360fb6b2',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_PROCESSING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'da310a63-d11d-4017-ba93-30452c3d50ec',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_PROCESSING_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '815e19f4-82b0-4c43-8cd6-2c809ca9ab2c',
      fieldMetadataUniversalIdentifier:
        DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_CODING_DEFAULTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '2fc5b1a6-8066-49e9-a702-078f4bed3878',
      fieldMetadataUniversalIdentifier:
        DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_CODING_DEFAULTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'e37060ff-b9c0-496b-9f6b-1893c5e29442',
      fieldMetadataUniversalIdentifier:
        DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_BATCH_DETAILS_CODING_DEFAULTS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
  ],
});
