import { defineField, FieldType, RelationType } from 'twenty-sdk';
import { GIFT_AID_CLAIM_BATCH_ON_GIFT_AID_CLAIM_SUBMISSION_FIELD_UNIVERSAL_IDENTIFIER } from './gift-aid-claim-batch-on-gift-aid-claim-submission.field';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';
import { GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-submission.object';

export const GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER =
  '36683bb4-8c8a-4a8f-b8ec-84713d133f18';

export default defineField({
  universalIdentifier:
    GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidClaimSubmissions',
  label: 'Gift Aid claim submissions',
  icon: 'IconSend',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_BATCH_ON_GIFT_AID_CLAIM_SUBMISSION_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
