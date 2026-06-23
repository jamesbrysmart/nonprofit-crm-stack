import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreements-on-fund.field';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER =
  '2bba9ecc-18a4-47e8-8ef6-4b4864d7978f';

export default defineField({
  universalIdentifier: FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'fund',
  label: 'Fund',
  icon: 'IconPigMoney',
  relationTargetObjectMetadataUniversalIdentifier:
    FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'fundId',
  },
});
