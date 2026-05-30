import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFT_STAGINGS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-appeal-source.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '0c05b958-b844-420e-b408-2d17714c8fd9';

export default defineField({
  universalIdentifier: APPEAL_SOURCE_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appealSource',
  label: 'Appeal source',
  icon: 'IconRoute2',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'appealSourceId',
  },
});
