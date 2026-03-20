import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { GIFT_STAGINGS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-fund.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '27e0ac60-5705-4a6f-9398-84dab0ef08d0';

export default defineField({
  universalIdentifier: FUND_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'fund',
  label: 'Fund',
  icon: 'IconCoinPound',
  relationTargetObjectMetadataUniversalIdentifier:
    FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'fundId',
  },
});
