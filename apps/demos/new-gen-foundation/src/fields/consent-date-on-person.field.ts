import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  universalIdentifier: 'd2101b1b-cb23-45fa-b657-883dc6f7804e',
  type: FieldType.DATE,
  name: 'consentDate',
  label: "GDPR consent date",
  icon: 'IconShieldCheck',
  isNullable: true,
});
