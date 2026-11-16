import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  DEFAULT_FUND_GIFT_BATCHES_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultFund',
  label: 'Default fund',
  icon: 'IconPigMoney',
  relationTargetObjectMetadataUniversalIdentifier:
    FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_FUND_GIFT_BATCHES_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'defaultFundId',
  },
});
