import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_OBJECT_UNIVERSAL_IDENTIFIER =
  '82e60d83-ff00-4951-81fe-e93641f3e4d4';

export const GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '04734741-acc2-408b-aec6-6b360504dc17';

export default defineObject({
  universalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'gift',
  namePlural: 'gifts',
  labelSingular: 'Gift',
  labelPlural: 'Gifts',
  description:
    'Minimal canonical gift object for the cloud fit spike processing path.',
  icon: 'IconGift',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'External ID',
      description: 'External or provider identifier for the gift.',
      icon: 'IconHash',
      isNullable: true,
    },
    {
      universalIdentifier: 'da6a12ea-d8cf-4bd9-9475-778191d75740',
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Canonical recorded gift amount.',
      icon: 'IconCurrencyPound',
      isNullable: true,
    },
    {
      universalIdentifier: '39f78bf1-6bd1-4967-8939-e14475bc2e1e',
      type: FieldType.DATE,
      name: 'giftDate',
      label: 'Gift Date',
      description: 'Date the donor made the gift.',
      icon: 'IconCalendarEvent',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '423e06da-7af9-41b3-9995-564275242115',
      type: FieldType.TEXT,
      name: 'donorEmail',
      label: 'Donor Email',
      description: 'Donor email preserved on the canonical gift.',
      icon: 'IconMail',
      isNullable: true,
    },
    {
      universalIdentifier: 'a0da9df3-aa0a-4c98-9b9f-f067c239960b',
      type: FieldType.TEXT,
      name: 'giftIntent',
      label: 'Gift Intent',
      description: 'Intent classification preserved from staging.',
      icon: 'IconTargetArrow',
      isNullable: true,
    },
  ],
});
