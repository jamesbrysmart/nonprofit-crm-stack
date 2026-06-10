import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { DEFAULT_APPEAL_SOURCE_GIFT_BATCHES_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-appeal-source-gift-batches-on-appeal-source.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER =
  'b0a71ab1-7c95-42db-b702-0cfd1e021859';

export default defineField({
  universalIdentifier:
    DEFAULT_APPEAL_SOURCE_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultAppealSource',
  label: 'Default appeal source',
  icon: 'IconRoute2',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_APPEAL_SOURCE_GIFT_BATCHES_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'defaultAppealSourceId',
  },
});
