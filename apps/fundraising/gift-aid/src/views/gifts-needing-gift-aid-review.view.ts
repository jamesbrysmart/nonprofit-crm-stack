import { defineView, ViewFilterOperand } from 'twenty-sdk/define';
import { GIFT_AID_NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  FUNDRAISING_GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import {
  GIFT_AID_CLAIM_BATCH_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: GIFT_AID_NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Aid review',
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconAlertCircle',
  position: 0,
  fields: [
    {
      universalIdentifier: 'c8d993b8-9ae7-4b30-9cbd-d1449226d73a',
      fieldMetadataUniversalIdentifier: FUNDRAISING_GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '9b4a1826-8179-4c0f-a2b2-df844d43b42c',
      fieldMetadataUniversalIdentifier: FUNDRAISING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'c2829a1f-20d0-4a81-a2bf-5c0bc458988e',
      fieldMetadataUniversalIdentifier: FUNDRAISING_GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '3fa7808c-1225-4f5d-af96-711103ac3d0d',
      fieldMetadataUniversalIdentifier: GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '558d18e0-5b6a-4c3e-9549-4eb2f65ed017',
      fieldMetadataUniversalIdentifier: GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 210,
    },
  ],
  filters: [
    {
      universalIdentifier: 'cd30b3a2-dd80-486e-a773-d2cac68117bf',
      fieldMetadataUniversalIdentifier: GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: JSON.stringify(['NEEDS_REVIEW']),
    },
    {
      universalIdentifier: '70f1e9e0-dc62-4b81-a8ba-9e667d7d062c',
      fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
  ],
});
