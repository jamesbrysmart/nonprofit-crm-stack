import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const NEXT_APPLICATION_DEADLINE_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'bb5262bb-7d99-4c4a-9b94-639327f616bd';

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
