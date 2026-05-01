import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const MAILING_ADDRESS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'f5c59cc5-b5ef-4ef2-b722-a9d6f8073ec1';

export default defineField({
  universalIdentifier: MAILING_ADDRESS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.ADDRESS,
  name: 'mailingAddress',
  label: 'Mailing Address',
  description: 'Primary mailing address used for fundraising and Gift Aid review.',
  icon: 'IconMapPin',
  isNullable: true,
  defaultValue: null,
});
