import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Aid claim batches',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconReceiptTax',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '1aeebbdd-05d3-40d5-9f69-a03621b91157',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'd3fee8a7-a240-4f3d-8f2e-b178f6feb365',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'e3fa4f54-44d3-4416-adaa-3854f445ec58',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '3bd60839-c112-47ca-a67f-3a7613d70901',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0772ab21-7933-4260-ad38-37f2428a27a7',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
  ],
});
