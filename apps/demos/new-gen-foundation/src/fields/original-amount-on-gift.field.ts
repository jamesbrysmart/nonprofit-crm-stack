import { defineField, FieldType } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

export default defineField({
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '97f3582d-b5eb-4d31-9115-dcba346319ee',
  type: FieldType.CURRENCY,
  name: 'originalAmount',
  label: "Original amount",
  icon: 'IconCurrency',
  description: "Amount in the donor's currency before conversion to EUR",
  isNullable: true,
});
