import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LIFETIME_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4';

export default defineField({
  universalIdentifier:
    LIFETIME_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'lifetimeGiftAmount',
  label: 'Lifetime Gift Amount',
  description:
    'Materialized lifetime total for committed gifts linked to this donor.',
  icon: 'IconCurrencyPound',
});
