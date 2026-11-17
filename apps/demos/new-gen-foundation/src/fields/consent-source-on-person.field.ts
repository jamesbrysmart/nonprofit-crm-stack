import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: '9f8bbadf-e989-4b66-976f-496353a1468d',
  type: FieldType.SELECT,
  name: 'consentSource',
  label: "GDPR consent source",
  icon: 'IconShieldCheck',
  options: [
    { value: 'WEBSITE', label: "Website form", position: 0, color: 'blue' },
    { value: 'EVENT', label: "Event", position: 1, color: 'purple' },
    { value: 'PAPER', label: "Paper form", position: 2, color: 'yellow' },
    { value: 'EMAIL', label: "Email", position: 3, color: 'sky' },
    { value: 'IMPORT', label: "Import", position: 4, color: 'gray' },
  ],
  isNullable: true,
});
