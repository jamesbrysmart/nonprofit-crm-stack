import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER =
  '14852d14-8f70-4c9e-9bd4-a2ef3c2a865d';

export const GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'a62ca844-097a-4ef5-8253-bbf2877d5fcc';

export const GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '7c67039e-42c3-4bbf-b890-93896cd14fe3';

export const GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'e2da8ee1-0256-4872-b2aa-1ac36634cc11';

export const GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER =
  '5ca27831-3175-49cc-94e0-89e99c67e094';

export const GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  '151bae33-9ebe-4b16-998c-b85fd7b54e22';

export default defineObject({
  universalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftStaging',
  namePlural: 'giftStagings',
  labelSingular: 'Gift Staging',
  labelPlural: 'Gift Stagings',
  description: 'Temporary staging record for gifts prior to processing.',
  icon: 'IconInbox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'a62ca844-097a-4ef5-8253-bbf2877d5fcc',
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Staged gift amount for processing.',
      icon: 'IconCurrencyPound',
      isNullable: true,
    },
    {
      universalIdentifier: '7c67039e-42c3-4bbf-b890-93896cd14fe3',
      type: FieldType.DATE,
      name: 'giftDate',
      label: 'Gift Date',
      description:
        'Date the donor made the gift, separate from settlement or payout timing.',
      icon: 'IconCalendarEvent',
      isNullable: true,
    },
    {
      universalIdentifier: '351c5b5b-358a-4bcb-8497-b6439d03f67c',
      type: FieldType.DATE,
      name: 'expectedAt',
      label: 'Expected At',
      description: 'Expected installment or fulfillment date for the staged gift.',
      icon: 'IconCalendarTime',
      isNullable: true,
    },
    {
      universalIdentifier: '796e4f56-ca6d-48d7-a32c-6c6989f42a34',
      type: FieldType.TEXT,
      name: 'validationStatus',
      label: 'Validation Status',
      description: 'Validation state captured during staging and processing.',
      icon: 'IconChecklist',
      isNullable: true,
    },
    {
      universalIdentifier: '5cdb2520-f79f-4b12-a9dd-605a0f95467e',
      type: FieldType.TEXT,
      name: 'dedupeStatus',
      label: 'Dedupe Status',
      description: 'Deduplication state used to determine processing readiness.',
      icon: 'IconBinaryTree2',
      isNullable: true,
    },
    {
      universalIdentifier: 'e2da8ee1-0256-4872-b2aa-1ac36634cc11',
      type: FieldType.TEXT,
      name: 'processingStatus',
      label: 'Processing Status',
      description: 'Current workflow state for the staged gift.',
      icon: 'IconArrowsShuffle',
      isNullable: true,
    },
    {
      universalIdentifier: '5ca27831-3175-49cc-94e0-89e99c67e094',
      type: FieldType.TEXT,
      name: 'errorDetail',
      label: 'Error Detail',
      description: 'Human-readable processing failure detail, if any.',
      icon: 'IconAlertCircle',
      isNullable: true,
    },
    {
      universalIdentifier: '4e3aff8b-604e-491a-ad74-7ed48ce28150',
      type: FieldType.RAW_JSON,
      name: 'processingDiagnostics',
      label: 'Processing Diagnostics',
      description: 'Structured diagnostics collected during staging and processing.',
      icon: 'IconBraces',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '3142850c-9990-410a-8e0e-e05aab3d429b',
      type: FieldType.RAW_JSON,
      name: 'rawPayload',
      label: 'Raw Payload',
      description: 'Original normalized payload captured at staging time.',
      icon: 'IconFileCode',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorEmail',
      label: 'Donor Email',
      description: 'Primary donor email captured for matching and review.',
      icon: 'IconMail',
      isNullable: true,
    },
    {
      universalIdentifier: '4305633b-3cb8-453a-8dfe-25045a5b6da0',
      type: FieldType.TEXT,
      name: 'donorFirstName',
      label: 'Donor First Name',
      description: 'Donor first name captured in the staged payload.',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      universalIdentifier: '41f3c3f1-dc1c-4822-a39f-3f61da0dc6d7',
      type: FieldType.TEXT,
      name: 'donorLastName',
      label: 'Donor Last Name',
      description: 'Donor last name captured in the staged payload.',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      universalIdentifier: 'b487331c-e8c8-4e71-8f9a-88b6d5c62abb',
      type: FieldType.TEXT,
      name: 'organizationName',
      label: 'Organization Name',
      description: 'Organization name used when the staged gift is company-backed.',
      icon: 'IconBuilding',
      isNullable: true,
    },
    {
      universalIdentifier: 'cdd71190-b315-4aa9-80fb-0b46b5ed6ced',
      type: FieldType.TEXT,
      name: 'giftIntent',
      label: 'Gift Intent',
      description: 'Intent classification carried through gift processing.',
      icon: 'IconTargetArrow',
      isNullable: true,
    },
  ],
});
