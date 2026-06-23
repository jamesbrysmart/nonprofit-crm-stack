import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const LAST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'efe5b3c8-6292-4e0a-8b9b-d2848d8f3f07';

export default defineField({
  universalIdentifier: LAST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.CURRENCY,
  name: 'lastGiftAmount',
  label: 'Last Gift Amount',
  description:
    'Materialized amount of the most recent committed gift for this donor.',
  icon: 'IconCurrencyPound',
  isNullable: true,
  defaultValue: null,
});
