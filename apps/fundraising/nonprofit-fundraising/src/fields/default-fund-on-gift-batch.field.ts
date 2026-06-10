import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { DEFAULT_FUND_GIFT_BATCHES_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-gift-batches-on-fund.field';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const DEFAULT_FUND_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER =
  '09e5cfde-1134-4b4e-9331-72d9844af4c8';

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
