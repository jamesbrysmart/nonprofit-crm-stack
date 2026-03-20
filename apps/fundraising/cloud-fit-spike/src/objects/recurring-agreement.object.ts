import { defineObject, FieldType } from 'twenty-sdk';

export const RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  'dc4b1e3d-d581-4e77-a9d6-0c6a5e075955';

export const RECURRING_AGREEMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER =
  '4ec1a54b-4c9e-4490-98a9-e6eb2793be78';

export default defineObject({
  universalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'recurringAgreement',
  namePlural: 'recurringAgreements',
  labelSingular: 'Recurring Agreement',
  labelPlural: 'Recurring Agreements',
  description:
    'Minimal recurring agreement object for the cloud fit spike processing path.',
  icon: 'IconRepeat',
  labelIdentifierFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        RECURRING_AGREEMENT_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'reference',
      label: 'Reference',
      description: 'Human-readable identifier for the recurring agreement.',
      icon: 'IconHash',
    },
    {
      universalIdentifier: '8f5c9864-e013-4867-b3f9-79c8e535635b',
      type: FieldType.TEXT,
      name: 'status',
      label: 'Status',
      description: 'Current recurring agreement status.',
      icon: 'IconProgress',
      isNullable: true,
    },
    {
      universalIdentifier: '0a18fcc0-441c-47e2-9a4c-e959b828f111',
      type: FieldType.TEXT,
      name: 'cadence',
      label: 'Cadence',
      description: 'Billing cadence for the agreement.',
      icon: 'IconCalendarRepeat',
      isNullable: true,
    },
    {
      universalIdentifier: '52c68b7e-1ec2-47c4-860c-f6b8c1ef9e46',
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Expected recurring amount.',
      icon: 'IconCurrencyPound',
      isNullable: true,
    },
    {
      universalIdentifier: '397f417f-2d9f-4162-aff7-3311eb46b4cc',
      type: FieldType.DATE,
      name: 'nextExpectedAt',
      label: 'Next Expected At',
      description: 'Next expected installment date.',
      icon: 'IconCalendarTime',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
