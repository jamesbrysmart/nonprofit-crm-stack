import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8',
  type: FieldType.MULTI_SELECT,
  name: 'constituentTypes',
  label: "Constituent types",
  icon: 'IconTags',
  options: [
    { value: 'DONOR', label: "Donor", position: 0, color: 'green' },
    { value: 'PATRON', label: "Patron", position: 1, color: 'purple' },
    { value: 'FRIEND', label: "Friend member", position: 2, color: 'pink' },
    { value: 'UNDER_35', label: "Under-35 member", position: 3, color: 'sky' },
    { value: 'ARTIST', label: "Artist", position: 4, color: 'orange' },
    { value: 'BOARD', label: "Board", position: 5, color: 'red' },
    { value: 'PROSPECT', label: "Prospect", position: 6, color: 'yellow' },
    { value: 'INSTITUTIONAL_CONTACT', label: "Institutional contact", position: 7, color: 'blue' },
    { value: 'NEWSLETTER', label: "Newsletter", position: 8, color: 'gray' },
    { value: 'VOLUNTEER', label: "Volunteer", position: 9, color: 'turquoise' },
    { value: 'PRESS', label: "Press", position: 10, color: 'gray' },
  ],
  isNullable: true,
});
