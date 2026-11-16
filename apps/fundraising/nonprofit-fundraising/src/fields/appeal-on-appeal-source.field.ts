import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
