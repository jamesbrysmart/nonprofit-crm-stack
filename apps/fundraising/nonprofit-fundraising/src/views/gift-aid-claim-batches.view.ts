import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-aid-claim-batch.object';

export const GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER =
  '1e811de4-6258-4539-b1c6-460d912cc612';

export default defineView({
  universalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Aid claim batches',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconReceiptTax',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '113e4f10-d7e8-497d-8ded-1cb316446a40',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '58574c98-cbec-42c1-a5f4-4f823ec7c1f3',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '5c978d8d-d6d4-48d4-af48-fb454e4d52eb',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '74be8950-f79e-410b-9174-45bb2de3f43e',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f044da0f-c96c-4d97-af9d-ee5bde1c9351',
      fieldMetadataUniversalIdentifier:
        GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
  ],
});
