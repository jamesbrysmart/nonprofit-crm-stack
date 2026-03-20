import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { GIFTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-fund.field';

export const FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  '8cfdf235-73f7-4b04-99b1-453b0fe0e312';

export default defineField({
  universalIdentifier: FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'fund',
  label: 'Fund',
  icon: 'IconCoinPound',
  relationTargetObjectMetadataUniversalIdentifier:
    FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'fundId',
  },
});
