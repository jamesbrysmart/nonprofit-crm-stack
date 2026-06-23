import { defineObject, FieldType } from 'twenty-sdk/define';

export const RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  '92bc83e5-09fc-48d7-871b-867fed9df969';

export const RECURRING_AGREEMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '5db48475-ba83-4a4f-b094-0a8488f0f7ef';

export const RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '5f260411-ae5f-4e28-b64a-bd2a3fa85afd';

export const RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER =
  '5af50e8e-5b3f-4cff-9b0f-57fd8fc932eb';

export const RECURRING_AGREEMENT_INTERVAL_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '8f77768e-cf0f-4feb-9636-e5ec8420c6c7';

export const RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'e59f2af4-f981-4256-8cb1-6980e9c1eb4d';

export const RECURRING_AGREEMENT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '26f567c6-9f52-496a-93da-e249f73d994c';

export const RECURRING_AGREEMENT_START_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '3d8b1af9-bf3a-479b-b6b0-5134b91a1b6a';

export const RECURRING_AGREEMENT_END_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '870a3379-bb47-4a44-a91a-1be338618870';

export const RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '29046850-a527-467a-b251-b33a9bab606d';

export const RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER =
  '87e84954-e972-4fd3-859f-a8d4d82b3049';

export const RECURRING_AGREEMENT_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '3ce9b953-f7f7-4565-8d70-81d4cd8407ba';

export const RECURRING_AGREEMENT_PROVIDER_PAYMENT_METHOD_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '2fbe145c-9e75-4af4-90d1-f9499ea23080';

export const RECURRING_AGREEMENT_MANDATE_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER =
  '7272cf2b-8dcb-4f96-bdff-e28ffec97de8';

export default defineObject({
  universalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'recurringAgreement',
  namePlural: 'recurringAgreements',
  labelSingular: 'Recurring agreement',
  labelPlural: 'Recurring agreements',
  description:
    'A donor commitment and expectation record for recurring fundraising.',
  icon: 'IconRepeat',
  labelIdentifierFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: RECURRING_AGREEMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable label for the recurring agreement',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Current operational status of the recurring agreement',
      icon: 'IconListCheck',
      defaultValue: "'ACTIVE'",
      options: [
        {
          id: 'e6354402-b2d2-4e27-9fe6-4743c5912120',
          value: 'ACTIVE',
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: '88dbf8af-59eb-49cc-9d0a-ae7b0ef5d7d2',
          value: 'PAUSED',
          label: 'Paused',
          position: 1,
          color: 'yellow',
        },
        {
          id: 'c687f3ce-05b8-44ee-b77f-fb13ea7539cc',
          value: 'CANCELED',
          label: 'Canceled',
          position: 2,
          color: 'gray',
        },
        {
          id: '2d65d5c0-fe6b-4f59-8344-50310b40eb66',
          value: 'COMPLETED',
          label: 'Completed',
          position: 3,
          color: 'blue',
        },
        {
          id: '40a1e8f7-b8be-40fc-b5a4-ced1786d8db1',
          value: 'DELINQUENT',
          label: 'Delinquent',
          position: 4,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'cadence',
      label: 'Cadence',
      description: 'How often the recurring commitment is expected to fulfill',
      icon: 'IconCalendarRepeat',
      defaultValue: "'MONTHLY'",
      options: [
        {
          id: '9877289a-7251-4259-adfd-a893fd1e25b8',
          value: 'WEEKLY',
          label: 'Weekly',
          position: 0,
          color: 'blue',
        },
        {
          id: 'd31fd296-7178-4f9b-b4d7-117203da5977',
          value: 'MONTHLY',
          label: 'Monthly',
          position: 1,
          color: 'green',
        },
        {
          id: '11bc9296-acd4-4908-8450-86db3f885c92',
          value: 'QUARTERLY',
          label: 'Quarterly',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'f1fd6d4d-7d85-4f5c-a7e5-c3f951f46839',
          value: 'ANNUAL',
          label: 'Annual',
          position: 3,
          color: 'orange',
        },
        {
          id: '0ae84f3c-5afb-4ece-8aa8-f69189fc5d8f',
          value: 'CUSTOM',
          label: 'Custom',
          position: 4,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_INTERVAL_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'intervalCount',
      label: 'Interval count',
      description:
        'How many cadence units define the recurring expectation interval',
      icon: 'IconHash',
      defaultValue: 1,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Expected amount for each recurring fulfillment',
      icon: 'IconCurrencyPound',
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'paymentType',
      label: 'Payment type',
      description: 'How gifts recorded from this agreement are expected to be paid',
      icon: 'IconCreditCard',
      isNullable: true,
      defaultValue: null,
      options: [
        {
          id: '0c6dae69-4ad5-4100-800d-e74d33799f95',
          value: 'CARD',
          label: 'Card',
          position: 0,
          color: 'blue',
        },
        {
          id: '024c1b28-5571-4160-865f-a757e89d4321',
          value: 'DIRECT_DEBIT',
          label: 'Direct debit',
          position: 1,
          color: 'blue',
        },
        {
          id: 'db9bef17-fee5-4c58-9554-56ad373b6768',
          value: 'BANK_TRANSFER',
          label: 'Bank transfer',
          position: 2,
          color: 'green',
        },
        {
          id: '06f9e56c-d6a3-48b5-94f3-8fb77f0d57cd',
          value: 'CASH',
          label: 'Cash',
          position: 3,
          color: 'yellow',
        },
        {
          id: '0e692ca6-5e64-489c-8e47-8c6111463769',
          value: 'CHEQUE',
          label: 'Cheque',
          position: 4,
          color: 'orange',
        },
        {
          id: '2a950ed7-411f-42f3-9cb2-0bb962b7985c',
          value: 'OTHER',
          label: 'Other',
          position: 5,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'startDate',
      label: 'Start date',
      description: 'When the recurring commitment started',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'endDate',
      label: 'End date',
      description: 'When the recurring commitment is expected to end, if known',
      icon: 'IconCalendarOff',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'nextExpectedAt',
      label: 'Next expected at',
      description: 'When the next recurring fulfillment is expected',
      icon: 'IconCalendarClock',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'provider',
      label: 'Provider',
      description: 'System or rail associated with this recurring agreement',
      icon: 'IconPlugConnected',
      defaultValue: "'MANUAL'",
      options: [
        {
          id: '19e9fa69-bff3-4869-8e9a-f0ec45ba3f91',
          value: 'STRIPE',
          label: 'Stripe',
          position: 0,
          color: 'blue',
        },
        {
          id: '0a94e18c-550a-4de7-b920-3e61b4196a05',
          value: 'GOCARDLESS',
          label: 'GoCardless',
          position: 1,
          color: 'green',
        },
        {
          id: '090884cb-9055-4ca5-bc17-fb5ecbc62be2',
          value: 'MANUAL',
          label: 'Manual',
          position: 2,
          color: 'gray',
        },
        {
          id: '7a43fe04-c908-43ae-aa2e-c9d1c6586805',
          value: 'IMPORTED',
          label: 'Imported',
          position: 3,
          color: 'orange',
        },
      ],
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerAgreementId',
      label: 'Provider agreement ID',
      description: 'Stable provider-side recurring agreement identifier',
      icon: 'IconLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_PAYMENT_METHOD_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerPaymentMethodId',
      label: 'Provider payment method ID',
      description: 'Provider-side payment method or mandate identifier',
      icon: 'IconCreditCard',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        RECURRING_AGREEMENT_MANDATE_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'mandateReference',
      label: 'Mandate reference',
      description: 'Bank mandate or similar provider reference when applicable',
      icon: 'IconFileCertificate',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
