import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER =
  '2b8f5f53-7ac8-48a6-a0ec-6573f97d4a64';

export const GIFT_AID_CLAIM_SUBMISSION_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '32748ece-ec5f-4501-878d-e91c0e86e0f4';

export const GIFT_AID_CLAIM_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'ba9c4186-b33f-4690-97de-c087c670d549';

export const GIFT_AID_CLAIM_SUBMISSION_ENVIRONMENT_FIELD_UNIVERSAL_IDENTIFIER =
  'e25404c8-f85b-490a-a859-ce5c82ee80bb';

export const GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '72f0d3e1-af64-4fe1-b7eb-875fd2df3f97';

export const GIFT_AID_CLAIM_SUBMISSION_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '8a3c9891-00df-452e-bd5c-c76fb5126fc4';

export const GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_TO_HMRC_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'b76d5675-593c-431f-8fa0-84f7d5d2a47b';

export const GIFT_AID_CLAIM_SUBMISSION_LAST_POLLED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '4b8986c9-da93-4291-8853-2d0cbe7cfa3e';

export const GIFT_AID_CLAIM_SUBMISSION_EXTERNAL_SUBMISSION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'fd9fa0f1-4e1a-4d7a-8a5d-eb79551cfe1d';

export const GIFT_AID_CLAIM_SUBMISSION_CORRELATION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '71ab14e7-fa8c-4ddf-a3ec-0e66bd3c1146';

export const GIFT_AID_CLAIM_SUBMISSION_TRANSACTION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '834765ee-9010-4dc4-9cff-7ef7ee1e26ef';

export const GIFT_AID_CLAIM_SUBMISSION_FAILURE_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  'b5175480-fcd2-46bb-952f-b17495a65245';

export const GIFT_AID_CLAIM_SUBMISSION_FAILURE_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER =
  'f2c5321c-8d32-419b-b673-af78b67d7ea3';

export const GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  '890f20bd-f263-49c2-96f2-a96bbd17d77c';

export const GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_HASH_FIELD_UNIVERSAL_IDENTIFIER =
  'bf1fd7c4-d486-4359-90eb-26c22ff0c788';

export const GIFT_AID_CLAIM_SUBMISSION_RESPONSE_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  '025d7ce6-c59e-485a-a226-a963c4236f0c';

export const GIFT_AID_CLAIM_SUBMISSION_ERROR_SUMMARY_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  '5562cefe-0c33-4aec-9d8e-4a061f867811';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaimSubmission',
  namePlural: 'giftAidClaimSubmissions',
  labelSingular: 'Gift Aid claim submission',
  labelPlural: 'Gift Aid claim submissions',
  description:
    'Durable submission history for the Gift Aid claim submission probe.',
  icon: 'IconSend',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_SUBMISSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconListCheck',
      defaultValue: "'QUEUED'",
      options: [
        { id: '6e062349-c418-4271-a813-7cf7bd8fc6ce', value: 'QUEUED', label: 'Queued', position: 0, color: 'gray' },
        { id: '3e4eeb17-571e-42f1-9f92-80f67d95af5d', value: 'BUILT', label: 'Built', position: 1, color: 'blue' },
        { id: 'c2eac49b-c716-4907-8f5a-6a7f959f36ef', value: 'SENT', label: 'Sent', position: 2, color: 'green' },
        { id: '2af9578e-4f45-4409-a86b-f90f2d98733e', value: 'FAILED', label: 'Failed', position: 3, color: 'red' },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_ENVIRONMENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'environment',
      label: 'Environment',
      icon: 'IconWorld',
      defaultValue: "'TEST'",
      options: [
        { id: '8e794e93-6dfe-4c87-a955-bfe88f1c56b3', value: 'TEST', label: 'Test', position: 0, color: 'blue' },
        { id: 'bb55789d-22bf-488d-a549-046fd40ec3d1', value: 'LIVE', label: 'Live', position: 1, color: 'orange' },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'submittedAt',
      label: 'Submitted at',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'completedAt',
      label: 'Completed at',
      icon: 'IconClockCheck',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_TO_HMRC_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'submittedToHmrcAt',
      label: 'Submitted to HMRC at',
      icon: 'IconClockPlay',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_LAST_POLLED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'lastPolledAt',
      label: 'Last polled at',
      icon: 'IconRefresh',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_EXTERNAL_SUBMISSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalSubmissionId',
      label: 'External submission id',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_CORRELATION_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'correlationId',
      label: 'Correlation id',
      icon: 'IconBinaryTree2',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_TRANSACTION_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'transactionId',
      label: 'Transaction id',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_FAILURE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'failureCode',
      label: 'Failure code',
      icon: 'IconAlertTriangle',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_FAILURE_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'failureMessage',
      label: 'Failure message',
      icon: 'IconMessageCircleExclamation',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_JSON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'snapshotJson',
      label: 'Snapshot JSON',
      icon: 'IconCode',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_HASH_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'snapshotHash',
      label: 'Snapshot hash',
      icon: 'IconFingerprint',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_RESPONSE_JSON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'responseJson',
      label: 'Response JSON',
      icon: 'IconCode',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_ERROR_SUMMARY_JSON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'errorSummaryJson',
      label: 'Error summary JSON',
      icon: 'IconCode',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
