import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  NEXT_APPLICATION_DEADLINE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    NEXT_APPLICATION_DEADLINE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE,
  name: 'nextApplicationDeadline',
  label: 'Next application deadline',
  description:
    'Nearest future application deadline across linked opportunities.',
  icon: 'IconCalendarEvent',
  isNullable: true,
  defaultValue: null,
});
