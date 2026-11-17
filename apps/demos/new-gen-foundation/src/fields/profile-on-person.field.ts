import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: '73d7f587-42d2-4be7-bcb0-acdade2f8952',
  type: FieldType.TEXT,
  name: 'profile',
  label: "Profile",
  icon: 'IconUserCircle',
  description: "Short biography or donor profile",
  isNullable: true,
});
