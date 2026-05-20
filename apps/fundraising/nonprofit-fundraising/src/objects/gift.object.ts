import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_OBJECT_UNIVERSAL_IDENTIFIER =
  'c48159d8-b904-4f31-b2ef-a8a27d0df848';

export const GIFT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '54717f2c-e673-45a8-9771-c31cc093c0f8';

export const GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '85198e1e-135b-47bf-bbd9-83c75f1c3989';

export const GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '993e89d3-5b1d-4f47-ad42-d438ea9fb326';

export const GIFT_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '57da6d2c-0eb4-45fa-9bc2-4597de6bd7bf';

export const GIFT_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '0345e11b-df06-4f91-b232-1dcb1365bcd4';

export const GIFT_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  '801acbd4-c386-44d4-98d5-7eb751baec7a';

export const GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '3cbc11d6-d0af-420f-ab8f-cd43bd3913a3';

export const GIFT_COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '81d4b8be-f4fc-4862-b964-2c8780eec656';

export const GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'fe6e8b0b-0921-4e6f-8334-88bb7326e07c';

export const GIFT_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER =
  '603d26f2-6909-403b-9052-bf3644398d29';

export const GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER =
  '0cb2b53a-f46b-4e0c-ae37-8fe1f60bffa1';

export const GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '41c3ad7e-e79b-42c5-a9ce-2e6b1690d951';

export const GIFT_REFUNDED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '5ff8c4d7-cfe2-4977-bd31-9db722990e5f';

export const GIFT_REFUND_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '2d4314c8-2fd9-4799-952b-2b808590f0cd';

export const GIFT_REFUND_NOTE_FIELD_UNIVERSAL_IDENTIFIER =
  '1f9cf126-e2d7-42aa-a447-0459d4113b6d';

export const GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '27718cee-e315-4c7c-8b83-35bd33820a24';

export const GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  'f545f42d-6e44-476c-8f98-1aa46dd6c3af';

export const GIFT_GIFT_AID_DECISION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '9cbdd59b-f87b-4e3c-85ca-e0fd4f42242d';

export const GIFT_GIFT_AID_LAST_EVALUATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'e2b47dd7-4de9-4dcc-8410-c19cb914196a';

export default defineObject({
  universalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'gift',
  namePlural: 'gifts',
  labelSingular: 'Gift',
  labelPlural: 'Gifts',
  description:
    'Committed fundraising gift records created directly from trusted manual entry.',
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
      universalIdentifier: GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'paymentType',
      label: 'Payment type',
      description: 'How the charity received the gift',
      icon: 'IconCreditCard',
      defaultValue: "'BANK_TRANSFER'",
      options: [
        {
          id: '90e8e311-a918-4443-a484-871a603dba20',
          value: 'CARD',
          label: 'Card',
          position: 0,
          color: 'blue',
        },
        {
          id: 'ae10bad2-4782-4bf0-81e8-b55288d2f5f8',
          value: 'DIRECT_DEBIT',
          label: 'Direct debit',
          position: 1,
          color: 'blue',
        },
        {
          id: 'c582872e-d89c-4949-8975-d7a868df8190',
          value: 'BANK_TRANSFER',
          label: 'Bank transfer',
          position: 2,
          color: 'green',
        },
        {
          id: 'f86577e5-c6cb-49af-89db-880e7bda5f83',
          value: 'CASH',
          label: 'Cash',
          position: 3,
          color: 'yellow',
        },
        {
          id: '805cc662-9365-426b-80a5-fca72675ef31',
          value: 'CHEQUE',
          label: 'Cheque',
          position: 4,
          color: 'orange',
        },
        {
          id: '4f312dc3-e657-4e4d-b2cb-c39ed10bf511',
          value: 'OTHER',
          label: 'Other',
          position: 5,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: GIFT_COMPANY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'companyName',
      label: 'Company name',
      description: 'Captured organisation name at entry time for company gifts',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'External ID',
      description: 'Donation-level identifier from the intake source',
      icon: 'IconExternalLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sourceFingerprint',
      label: 'Source fingerprint',
      description: 'Replay-safe source fingerprint used for intake idempotency',
      icon: 'IconFingerprint',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'provider',
      label: 'Provider',
      description: 'Source provider or channel label carried onto the committed gift',
      icon: 'IconPlugConnected',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerPaymentId',
      label: 'Provider payment ID',
      description: 'Provider-side payment reference when available',
      icon: 'IconReceiptPound',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_REFUNDED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'refundedAmount',
      label: 'Refunded amount',
      description: 'Total amount later refunded against this original gift',
      icon: 'IconArrowBackUp',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_REFUND_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'refundDate',
      label: 'Refund date',
      description: 'Effective date of the currently recorded refund on this gift',
      icon: 'IconCalendarTime',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_REFUND_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'refundNote',
      label: 'Refund note',
      description: 'Lightweight operational note explaining the refund',
      icon: 'IconNote',
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
          id: 'da43038d-eaa3-4faf-8a40-5584c7cbc9d9',
          value: 'CLAIMABLE',
          label: 'Claimable',
          position: 0,
          color: 'green',
        },
        {
          id: 'a8cb42a4-1c8b-4ecf-b2f4-56ce6a9b0dc6',
          value: 'NOT_CLAIMABLE',
          label: 'Not claimable',
          position: 1,
          color: 'gray',
        },
        {
          id: '4b214a26-3112-41b6-baf2-fb5a8274316c',
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
      description:
        'Whether the current Gift Aid outcome was derived automatically or set manually',
      icon: 'IconBolt',
      defaultValue: "'SYSTEM'",
      options: [
        {
          id: '6b3599d7-cb4c-410d-8ae9-b75f9c907b1d',
          value: 'SYSTEM',
          label: 'System',
          position: 0,
          color: 'blue',
        },
        {
          id: '4ab5b752-bae7-4c7e-aacf-8930b44d301e',
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
