import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  LAST_GIFT_DATE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
