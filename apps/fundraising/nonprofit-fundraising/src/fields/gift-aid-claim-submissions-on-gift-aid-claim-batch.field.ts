import {
  defineField,
  FieldType,
  RelationType,
} from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_ON_GIFT_AID_CLAIM_SUBMISSION_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
