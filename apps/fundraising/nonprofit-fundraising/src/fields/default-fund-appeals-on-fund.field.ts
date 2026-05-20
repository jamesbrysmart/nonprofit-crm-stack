import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-on-appeal.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';

export const DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER =
  '04901780-640e-4fe1-a554-bf40eb3ad6af';

export default defineField({
  universalIdentifier:
    DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultFundAppeals',
  label: 'Default-fund appeals',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
