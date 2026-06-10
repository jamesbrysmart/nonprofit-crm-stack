import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-on-gift-batch.field';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_FUND_GIFT_BATCHES_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER =
  '3aa2111e-8f01-4d8a-b740-3d483e729c39';

export default defineField({
  universalIdentifier:
    DEFAULT_FUND_GIFT_BATCHES_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultGiftBatches',
  label: 'Default gift batches',
  icon: 'IconStack2',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
