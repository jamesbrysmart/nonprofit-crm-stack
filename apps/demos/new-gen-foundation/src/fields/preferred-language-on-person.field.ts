import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: 'ee5bc63f-cd8f-4793-95bc-165fcc30af7c',
  type: FieldType.SELECT,
  name: 'preferredLanguage',
  label: "Preferred language",
  icon: 'IconLanguage',
  options: [
    { value: 'IT', label: "Italiano", position: 0, color: 'green' },
    { value: 'EN', label: "English", position: 1, color: 'blue' },
    { value: 'FR', label: "Français", position: 2, color: 'sky' },
    { value: 'DE', label: "Deutsch", position: 3, color: 'yellow' },
  ],
  isNullable: true,
});
