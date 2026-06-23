import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const AWARDED_OPPORTUNITY_COUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'ef818dd3-d306-42f3-8c28-3f7f667117d6';

export default defineField({
  universalIdentifier:
    AWARDED_OPPORTUNITY_COUNT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'awardedOpportunityCount',
  label: 'Awarded opportunity count',
  description:
    'Number of linked opportunities where awarded amount is populated.',
  icon: 'IconHash',
  isNullable: true,
  defaultValue: null,
});
