import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

import { PROGRAMME_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-on-fund.field';

export const FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER =
  '4a5af130-7870-4743-a536-3bbc42a599cf';

export default defineField({
  universalIdentifier: FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  type: FieldType.RELATION,
  name: 'funds',
  label: "Funds",
  icon: 'IconPigMoney',
  relationTargetObjectMetadataUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
