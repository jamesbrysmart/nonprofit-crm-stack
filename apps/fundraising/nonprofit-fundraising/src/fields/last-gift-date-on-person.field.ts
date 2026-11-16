import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  LAST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.DATE,
  name: 'lastGiftDate',
  label: 'Last Gift Date',
  description:
    'Materialized most recent committed gift date for this donor.',
  icon: 'IconCalendar',
  isNullable: true,
  defaultValue: null,
});
