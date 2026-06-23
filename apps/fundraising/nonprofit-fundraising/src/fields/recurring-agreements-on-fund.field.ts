import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-recurring-agreement.field';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER =
  '7f671ea0-d6cb-4ed6-b2df-cbe2d1dfaa2f';

export default defineField({
  universalIdentifier: RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recurringAgreements',
  label: 'Recurring agreements',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
