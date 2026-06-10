import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-appeal-source-on-gift-batch.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_APPEAL_SOURCE_GIFT_BATCHES_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  'e98a34bb-3f2c-4f0d-a73f-9ed6fc6fb0fb';

export default defineField({
  universalIdentifier:
    DEFAULT_APPEAL_SOURCE_GIFT_BATCHES_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultGiftBatches',
  label: 'Default gift batches',
  icon: 'IconStack2',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
