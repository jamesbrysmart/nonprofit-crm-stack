import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { GIFTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-appeal.field';

export const APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  'afa91b21-ddb5-4471-9732-57a8b194950b';

export default defineField({
  universalIdentifier: APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appeal',
  label: 'Appeal',
  icon: 'IconSpeakerphone',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'appealId',
  },
});
