import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGINGS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GIFT_BATCH_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftBatch',
  label: 'Gift batch',
  icon: 'IconStack2',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftBatchId',
  },
});
