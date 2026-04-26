import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_OBJECT_UNIVERSAL_IDENTIFIER =
  '2085927c-3fea-48ab-a510-0fd6850d4b57';

export const GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f7549950-3994-452c-97ea-c8da8b20f95c';

export const GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '8559e6db-ca69-4e7e-91e0-43f487fd0af8';

export const GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  'b8f1671b-6e09-4e3a-bbfc-05933a544760';

export const GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f1e506e1-a73f-489f-b0af-bd7977d01bce';

export const GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '0f60368d-72ff-4f22-901d-124e629e4e2f';

export const GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  'cb38c264-4e29-47b8-94a8-517198db73a1';

export const GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'e1a37af0-2d09-45ec-a49b-1f609676f9e2';

export const GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  '1c89dd68-c163-47a1-ba4f-1ec73cd3fb90';

export const GIFT_GIFT_AID_DECISION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '7e8d1512-54db-4f5c-b11d-0c3efac8d18a';

export const GIFT_GIFT_AID_LAST_EVALUATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '7db7b899-83d9-44f4-86b6-713db8e4e1b1';

export default defineObject({
  universalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'gift',
  namePlural: 'gifts',
  labelSingular: 'Gift',
  labelPlural: 'Gifts',
  description:
    'Minimal fundraising gift object for manual-entry proof inside Twenty apps.',
  icon: 'IconGift',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable label for the gift record',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Gift amount',
      icon: 'IconCurrencyPound',
    },
    {
      universalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'giftDate',
      label: 'Gift date',
      description: 'Date the donor made the gift',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorFirstName',
      label: 'Donor first name',
      description: 'Captured donor first name at entry time',
      icon: 'IconUser',
    },
    {
      universalIdentifier: GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorLastName',
      label: 'Donor last name',
      description: 'Captured donor last name at entry time',
      icon: 'IconUser',
    },
    {
      universalIdentifier: GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorEmail',
      label: 'Donor email',
      description: 'Captured donor email at entry time',
      icon: 'IconAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'giftAidStatus',
      label: 'Gift Aid status',
      description: 'Current Gift Aid outcome on the final gift',
      icon: 'IconRosetteDiscountCheck',
      defaultValue: "'NOT_CLAIMABLE'",
      options: [
        {
          id: '2a1ef5aa-3e6c-4c49-96de-43657dae5814',
          value: 'CLAIMABLE',
          label: 'Claimable',
          position: 0,
          color: 'green',
        },
        {
          id: '80844242-7d2d-49d5-84a2-0b14a6d3c3c1',
          value: 'NOT_CLAIMABLE',
          label: 'Not claimable',
          position: 1,
          color: 'gray',
        },
        {
          id: '377ef72b-f8f0-4c7e-b6f4-8d2463237ac8',
          value: 'NEEDS_REVIEW',
          label: 'Needs review',
          position: 2,
          color: 'yellow',
        },
      ],
    },
    {
      universalIdentifier: GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidReasonCode',
      label: 'Gift Aid reason code',
      description: 'Machine-readable reason for the current Gift Aid outcome',
      icon: 'IconAlertCircle',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_GIFT_AID_DECISION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'giftAidDecisionSource',
      label: 'Gift Aid decision source',
      description: 'Whether the current Gift Aid outcome was set by the system or manually',
      icon: 'IconBolt',
      defaultValue: "'SYSTEM'",
      options: [
        {
          id: '23fcaa93-0536-46be-9025-2c66c2976f7a',
          value: 'SYSTEM',
          label: 'System',
          position: 0,
          color: 'blue',
        },
        {
          id: 'c7c17d44-e46b-44c9-9ec6-20fbfd78e03a',
          value: 'MANUAL_OVERRIDE',
          label: 'Manual override',
          position: 1,
          color: 'orange',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_GIFT_AID_LAST_EVALUATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'giftAidLastEvaluatedAt',
      label: 'Gift Aid last evaluated at',
      description: 'When the current Gift Aid outcome was last derived',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
