import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { DEFAULT_APPEAL_GIFT_BATCHES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-appeal-gift-batches-on-appeal.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER =
  'e0d9c795-9460-4f1d-bb49-03f03eddb365';

export default defineField({
  universalIdentifier: DEFAULT_APPEAL_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultAppeal',
  label: 'Default appeal',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_APPEAL_GIFT_BATCHES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'defaultAppealId',
  },
});
