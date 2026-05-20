import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-appeals-on-fund.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';

export const DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER =
  '94d1afe8-f659-4dfc-b7d8-8f30fbf87214';

export default defineField({
  universalIdentifier: DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultFund',
  label: 'Default fund',
  icon: 'IconPigMoney',
  relationTargetObjectMetadataUniversalIdentifier:
    FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'defaultFundId',
  },
});
