import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-appeal-on-gift-batch.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_APPEAL_GIFT_BATCHES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER =
  '717fef0f-b548-4493-868e-e076ae33ee60';

export default defineField({
  universalIdentifier:
    DEFAULT_APPEAL_GIFT_BATCHES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultGiftBatches',
  label: 'Default gift batches',
  icon: 'IconStack2',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
