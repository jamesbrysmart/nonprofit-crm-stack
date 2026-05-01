import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-aid-claim-submissions-on-gift-aid-claim-batch.field';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';
import { GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-submission.object';

export const GIFT_AID_CLAIM_BATCH_ON_GIFT_AID_CLAIM_SUBMISSION_FIELD_UNIVERSAL_IDENTIFIER =
  '06d43b4a-37d6-4e6f-aa0c-941d8fbcef1b';

export default defineField({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCH_ON_GIFT_AID_CLAIM_SUBMISSION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidClaimBatch',
  label: 'Gift Aid claim batch',
  icon: 'IconReceiptTax',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftAidClaimBatchId',
  },
});
