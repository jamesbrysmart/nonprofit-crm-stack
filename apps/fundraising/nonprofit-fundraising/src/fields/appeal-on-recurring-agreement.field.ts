import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { RECURRING_AGREEMENTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreements-on-appeal.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER =
  'ebceb133-65ed-459a-bdc5-fd7e461dd85e';

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
