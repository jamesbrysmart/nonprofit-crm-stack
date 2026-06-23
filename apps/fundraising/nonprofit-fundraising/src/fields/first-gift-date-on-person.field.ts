import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const FIRST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'ad86f83d-658f-4392-b9b9-b5d2343660ad';

export default defineField({
  universalIdentifier: FIRST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.DATE,
  name: 'firstGiftDate',
  label: 'First Gift Date',
  description:
    'Materialized earliest committed gift date for this donor.',
  icon: 'IconCalendar',
  isNullable: true,
  defaultValue: null,
});
