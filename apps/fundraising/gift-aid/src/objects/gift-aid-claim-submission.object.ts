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
  isUICreatable: false,
  disabledObjectPermissionActions: [
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
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
          id: '93d74ae0-6b96-4b65-9b5a-720deefd9460',
          value: 'QUEUED',
          label: 'Queued',
          position: 0,
          color: 'gray',
        },
        {
          id: 'f0e1009f-42ac-4520-80f3-f661dfe89c1b',
          value: 'BUILT',
          label: 'Built',
          position: 1,
          color: 'blue',
        },
        {
          id: '819560d7-0ae3-4937-b18f-36c59461547f',
          value: 'ACKNOWLEDGED',
          label: 'Acknowledged',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'f6aafd27-180b-4dd0-9791-65ce45a985e3',
          value: 'AWAITING_RESPONSE',
          label: 'Awaiting response',
          position: 3,
          color: 'orange',
        },
        {
          id: '9ea12124-a87e-499c-af96-c7fcc8b563b2',
          value: 'RESPONDED',
          label: 'Responded',
          position: 4,
          color: 'green',
        },
        {
          id: '404541b7-f745-4b6f-841a-f3759f7c93e4',
          value: 'FAILED',
          label: 'Failed',
          position: 5,
          color: 'red',
        },
        {
          id: '7bf643ac-f1ea-4a24-b8dc-58b842a76823',
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
          id: '8eb8cf27-d723-42c8-81be-4bad1ee66054',
          value: 'TEST',
          label: 'Test',
          position: 0,
          color: 'blue',
        },
        {
          id: '97e0eb71-3c19-44d0-b05f-9944c6bc3eec',
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
