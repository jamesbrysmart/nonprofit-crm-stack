import { defineView, ViewKey } from 'twenty-sdk';
import {
  GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-aid-claim-batch.object';

export const GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER =
  '817d0908-d6fe-4fd7-ae3d-5055f8651778';

export default defineView({
  universalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Aid claim batches',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconReceiptTax',
  key: ViewKey.INDEX,
  position: 30,
  fields: [
    { universalIdentifier: '9e330a88-4f6d-4f22-9179-faf9d7a934ca', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '7e7fc3a8-5db1-4604-9d95-08913d215cba', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'e505471b-e6b9-4070-8182-df8bb95c33f1', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 120 },
    { universalIdentifier: 'a1093cb0-bab2-4180-9503-1fb38aa840ff', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 180 },
    { universalIdentifier: '9457637a-d562-4fbf-b38a-79d7d59f016f', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 150 },
    { universalIdentifier: '6f0dd646-80bc-41c1-bf92-e574f9947579', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 150 },
    { universalIdentifier: '7d71233c-8daa-4f73-b088-8dc6fa78f8dc', fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 180 },
  ],
});
