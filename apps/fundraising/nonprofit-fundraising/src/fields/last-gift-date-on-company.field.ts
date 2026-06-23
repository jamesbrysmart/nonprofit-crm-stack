import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LAST_GIFT_DATE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'c90389d5-19f7-4c52-8718-c8a0a17d0c9f';

export default defineField({
  universalIdentifier: LAST_GIFT_DATE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE,
  name: 'lastGiftDate',
  label: 'Last gift date',
  description: 'Most recent cash gift date from this company.',
  icon: 'IconCalendar',
  isNullable: true,
  defaultValue: null,
});
