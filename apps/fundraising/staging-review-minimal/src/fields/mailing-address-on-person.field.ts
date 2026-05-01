import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const MAILING_ADDRESS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'c6d1e6bd-4ffc-43dd-9a4a-24ae8c6f8ff8';

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
