import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LIFETIME_GIFT_COUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '27924290-c4bd-4e4f-8e9d-79f477b7104a';

export default defineField({
  universalIdentifier:
    LIFETIME_GIFT_COUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'lifetimeGiftCount',
  label: 'Lifetime Gift Count',
  description:
    'Materialized count of committed gifts linked to this donor.',
  icon: 'IconHash',
  defaultValue: 0,
});
