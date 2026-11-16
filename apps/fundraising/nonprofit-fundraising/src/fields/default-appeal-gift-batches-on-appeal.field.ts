import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  DEFAULT_APPEAL_GIFT_BATCHES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
