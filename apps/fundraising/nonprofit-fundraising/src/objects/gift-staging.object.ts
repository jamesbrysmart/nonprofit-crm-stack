import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER =
  '08728a51-beba-4b08-b649-ae4aa0716ff1';

export const GIFT_STAGING_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '2c1cb655-7541-4ea0-91f9-8ac0eb9024b3';

export const GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  'c4327d6c-af6f-4269-9f46-fb9ea94b745e';

export const GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '0a3517f3-f647-4331-b7eb-a2337b2dbec5';

export const GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '4e3f98f2-8197-428c-9c48-1ce57cf73ddd';

export const GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '0f4cf644-e073-42eb-8df1-f776d4b5c3dc';

export const GIFT_STAGING_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER =
  '0b5d44b4-917b-4fa4-80b4-bf9b8dcbafaf';

export const GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER =
  'f9d4bbd2-95fc-41c1-92f3-c5cb83a00ca8';

export const GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'a3e18807-c5e7-46d2-b76f-c70ecb3c8866';

export const GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '1abeaa48-c16a-4e31-8cd5-7fdd1c95dcc0';

export const GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'fc87ed4a-fd88-4769-aa0e-5ad2e8b7c8cd';

export const GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'b369e257-a753-4f64-bbe1-301f16d0cf53';

export const GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  '88dbdeaa-6eaf-4d18-a599-c1e4e75f8a94';

export const GIFT_STAGING_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  '0d638f6a-901f-4974-85f6-bfda935c17f9';

export const GIFT_STAGING_HAS_CORE_GIFT_ISSUE_FIELD_UNIVERSAL_IDENTIFIER =
  '51744ec6-df52-42b5-8534-b29e6882c4d3';

export const GIFT_STAGING_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER =
  'cb3d34bd-6b3d-4b33-85c0-db4db0be35a4';

export const GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'ff99598e-8d08-436f-952c-ba295af9db28';

export const GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER =
  'add47f09-aa1d-4038-bbc1-63ac4186ab92';

export const GIFT_STAGING_GIFT_AID_REQUESTED_FIELD_UNIVERSAL_IDENTIFIER =
  '21d6a10d-59a6-4b91-b7e8-732fd59f7ce3';

export const GIFT_STAGING_GIFT_AID_DECLARATION_CAPTURED_FIELD_UNIVERSAL_IDENTIFIER =
  '19dfc9bf-bc03-4d7c-a76f-56706baaaf09';

export const GIFT_STAGING_GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  'cbf5150b-94a1-4ad9-8e18-0e9fc3e407e6';

export const GIFT_STAGING_GIFT_AID_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER =
  'd86d4eec-efd0-4077-8d59-91f07b784de6';

export const GIFT_STAGING_GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '9b6c5f65-8372-44c5-bec6-61cc57ad3d6b';

export const GIFT_STAGING_GIFT_AID_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  '44188431-92b9-43a1-8504-a2c608c70c78';

export default defineObject({
  universalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftStaging',
  namePlural: 'giftStagings',
  labelSingular: 'Gift staging row',
  labelPlural: 'Gift staging rows',
  description:
    'Uncommitted fundraising intake records reviewed before processing into canonical gifts.',
  icon: 'IconInbox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_STAGING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_STAGING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Short review label for the staged gift',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'intakeSource',
      label: 'Intake source',
      description: 'Lower-trust intake channel that created the staging row',
      icon: 'IconArrowDown',
    },
    {
      universalIdentifier: GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      description: 'Captured staged gift amount',
      icon: 'IconCurrencyPound',
    },
    {
      universalIdentifier: GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'giftDate',
      label: 'Gift date',
      description: 'Captured staged gift date',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'External ID',
      description: 'Donation-level identifier from the intake source',
      icon: 'IconExternalLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sourceFingerprint',
      label: 'Source fingerprint',
      description: 'Replay-safe source fingerprint used for intake idempotency',
      icon: 'IconFingerprint',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'provider',
      label: 'Provider',
      description: 'Provider or channel system that originated the staged row',
      icon: 'IconPlugConnected',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerPaymentId',
      label: 'Provider payment ID',
      description: 'Provider-side payment reference when available',
      icon: 'IconReceiptPound',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerAgreementId',
      label: 'Provider agreement ID',
      description:
        'Provider-side recurring agreement or subscription reference when available',
      icon: 'IconRepeat',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_STAGING_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorFirstName',
      label: 'Donor first name',
      description: 'Incoming donor evidence first name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: GIFT_STAGING_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorLastName',
      label: 'Donor last name',
      description: 'Incoming donor evidence last name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: GIFT_STAGING_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorEmail',
      label: 'Donor email',
      description: 'Incoming donor evidence email',
      icon: 'IconAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'donorResolutionState',
      label: 'Donor resolution state',
      icon: 'IconUserCheck',
      defaultValue: "'UNREVIEWED'",
      options: [
        {
          id: '8e6ad537-84b4-4664-b24d-b135a8a5e91a',
          value: 'UNREVIEWED',
          label: 'Unreviewed',
          position: 0,
          color: 'yellow',
        },
        {
          id: '520a5c88-ee78-43c8-bb30-8cfcf6b8dd5f',
          value: 'AMBIGUOUS',
          label: 'Ambiguous',
          position: 1,
          color: 'orange',
        },
        {
          id: '2fb2e1ca-bf86-4228-b9f8-dbc0eb530f3f',
          value: 'UNRESOLVED',
          label: 'Unresolved',
          position: 2,
          color: 'gray',
        },
        {
          id: 'df733148-68f7-4531-a422-44f914b43676',
          value: 'CONFIRMED',
          label: 'Confirmed',
          position: 3,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_STAGING_HAS_CORE_GIFT_ISSUE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'hasCoreGiftIssue',
      label: 'Has core gift issue',
      description: 'Whether core gift facts still block this row',
      icon: 'IconAlertCircle',
      defaultValue: false,
    },
    {
      universalIdentifier:
        GIFT_STAGING_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isReadyForProcessing',
      label: 'Ready for processing',
      description: 'Explicit reviewer intent that the row is ready',
      icon: 'IconListCheck',
      defaultValue: false,
    },
    {
      universalIdentifier: GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'processingStatus',
      label: 'Processing status',
      icon: 'IconArrowsShuffle',
      defaultValue: "'NOT_READY'",
      options: [
        {
          id: 'd4d6b764-d8d2-44b4-bd50-cdb28b9a7fe0',
          value: 'NOT_READY',
          label: 'Not ready',
          position: 0,
          color: 'gray',
        },
        {
          id: '55a4df4c-8d0a-4695-9518-cc3fd3b36da1',
          value: 'READY',
          label: 'Ready',
          position: 1,
          color: 'yellow',
        },
        {
          id: 'af7ba0bb-447c-44a6-8ad0-a06d11e30c8f',
          value: 'PROCESSED',
          label: 'Processed',
          position: 2,
          color: 'green',
        },
        {
          id: '8ce0c8de-43b5-4f32-a1d0-4f53e274d5d4',
          value: 'PROCESS_FAILED',
          label: 'Process failed',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'errorDetail',
      label: 'Error detail',
      description: 'Last processing error written back to the staging row',
      icon: 'IconAlertTriangle',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_REQUESTED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'giftAidRequested',
      label: 'Gift Aid requested',
      description: 'Whether Gift Aid was requested for this staged gift',
      icon: 'IconRosetteDiscountCheck',
      defaultValue: false,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_DECLARATION_CAPTURED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'giftAidDeclarationCaptured',
      label: 'Gift Aid declaration captured',
      description:
        'Whether declaration facts were captured during intake for this staged gift',
      icon: 'IconFileCertificate',
      defaultValue: false,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'giftAidDeclarationDate',
      label: 'Gift Aid declaration date',
      description: 'Captured declaration date if known during intake',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidCoverageScope',
      label: 'Gift Aid coverage scope',
      description: 'Captured declaration coverage scope if known during intake',
      icon: 'IconTimeline',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidDeclarationSource',
      label: 'Gift Aid declaration source',
      description: 'How the declaration facts were captured during intake',
      icon: 'IconWebhook',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_STAGING_GIFT_AID_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidTextVersion',
      label: 'Gift Aid text version',
      description: 'Declaration wording or version captured during intake',
      icon: 'IconTextCaption',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
