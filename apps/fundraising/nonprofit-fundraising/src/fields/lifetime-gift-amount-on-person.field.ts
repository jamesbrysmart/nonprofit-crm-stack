import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  LIFETIME_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
