import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { GIFT_STAGINGS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-appeal.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '31a545a4-1fdc-431a-87e0-79113dc8f71e';

export default defineField({
  universalIdentifier: APPEAL_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appeal',
  label: 'Appeal',
  icon: 'IconSpeakerphone',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'appealId',
  },
});
