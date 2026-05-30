import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const SUPPORTER_EMAIL_OPT_OUT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'f55d51d3-dc9e-4258-a6b2-0b4bd9838386';

export default defineField({
  universalIdentifier:
    SUPPORTER_EMAIL_OPT_OUT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'supporterEmailOptOut',
  label: 'Supporter email opt-out',
  description:
    'Do not send supporter emails such as appeals, newsletters, volunteering asks, campaign updates, and general updates',
  icon: 'IconMailOff',
  defaultValue: false,
});
