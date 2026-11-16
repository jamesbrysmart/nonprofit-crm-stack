import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_SUBMISSION_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_CORRELATION_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_ENVIRONMENT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_ERROR_SUMMARY_JSON_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_FAILURE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_FAILURE_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_LAST_POLLED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_RESPONSE_JSON_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_HASH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_JSON_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_TO_HMRC_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSION_TRANSACTION_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaimSubmission',
  namePlural: 'giftAidClaimSubmissions',
  labelSingular: 'Gift Aid claim submission',
  labelPlural: 'Gift Aid claim submissions',
  description:
    'Durable HMRC submission history for finalized Gift Aid claim batches.',
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
        {
          id: '8d35af91-f6cf-4de5-89b4-683f7bd284ad',
          value: 'QUEUED',
          label: 'Queued',
          position: 0,
          color: 'gray',
        },
        {
          id: '77ff1ed7-c059-4762-8cae-0c7125496950',
          value: 'BUILT',
          label: 'Built',
          position: 1,
          color: 'blue',
        },
        {
          id: 'f56ef620-6fbf-48a5-aa31-3c1dbb7d50ae',
          value: 'ACKNOWLEDGED',
          label: 'Acknowledged',
          position: 2,
          color: 'yellow',
        },
        {
          id: '2e7a0a8a-4692-4bfe-82ee-4234a7d54a68',
          value: 'AWAITING_RESPONSE',
          label: 'Awaiting response',
          position: 3,
          color: 'orange',
        },
        {
          id: 'f4adcd5c-2516-4eef-a8ee-3df92fb6ebae',
          value: 'RESPONDED',
          label: 'Responded',
          position: 4,
          color: 'green',
        },
        {
          id: '3c13e9a7-eb26-4976-b0c0-0665a0c2df6b',
          value: 'FAILED',
          label: 'Failed',
          position: 5,
          color: 'red',
        },
        {
          id: 'af2d9e2d-e28d-4b6b-b357-874145d67aa2',
          value: 'TIMED_OUT',
          label: 'Timed out',
          position: 6,
          color: 'red',
        },
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
        {
          id: '3851c4ea-9bf4-4882-93fb-3e56c686b134',
          value: 'TEST',
          label: 'Test',
          position: 0,
          color: 'blue',
        },
        {
          id: 'f5abf8fd-37da-484d-b497-fcf768d3d8b1',
          value: 'LIVE',
          label: 'Live',
          position: 1,
          color: 'orange',
        },
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
      type: FieldType.RAW_JSON,
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
      type: FieldType.RAW_JSON,
      name: 'responseJson',
      label: 'Response JSON',
      icon: 'IconCode',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_SUBMISSION_ERROR_SUMMARY_JSON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'errorSummaryJson',
      label: 'Error summary JSON',
      icon: 'IconCode',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
