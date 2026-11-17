import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: 'cab5fc6f-ee17-4b7f-aa28-2f484348cf39',
  type: FieldType.SELECT,
  name: 'newsletterStatus',
  label: "Newsletter",
  icon: 'IconMail',
  options: [
    { value: 'SUBSCRIBED', label: "Subscribed", position: 0, color: 'green' },
    { value: 'UNSUBSCRIBED', label: "Unsubscribed", position: 1, color: 'red' },
    { value: 'NOT_SUBSCRIBED', label: "Not subscribed", position: 2, color: 'gray' },
  ],
  isNullable: true,
});
