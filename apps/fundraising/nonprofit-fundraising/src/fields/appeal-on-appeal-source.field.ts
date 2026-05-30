import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { APPEAL_SOURCES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-sources-on-appeal.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';

export const APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  'c4dc4a44-c45e-447d-a3d9-95b6fd5b0752';

export default defineField({
  universalIdentifier: APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appeal',
  label: 'Appeal',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_SOURCES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'appealId',
  },
});
