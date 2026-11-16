import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appeal',
  label: 'Appeal',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'appealId',
  },
});
