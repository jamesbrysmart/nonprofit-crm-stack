import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: 'c6ab9c22-2d8f-4238-9788-ddf561ebc19f',
  type: FieldType.MULTI_SELECT,
  name: 'contactPreferences',
  label: "Contact preferences",
  icon: 'IconAddressBook',
  options: [
    { value: 'EMAIL', label: "Email", position: 0, color: 'blue' },
    { value: 'POST', label: "Post", position: 1, color: 'yellow' },
    { value: 'PHONE', label: "Phone", position: 2, color: 'green' },
    { value: 'EVENTS', label: "Event invitations", position: 3, color: 'purple' },
    { value: 'NO_CONTACT', label: "Do not contact", position: 4, color: 'red' },
  ],
  isNullable: true,
});
