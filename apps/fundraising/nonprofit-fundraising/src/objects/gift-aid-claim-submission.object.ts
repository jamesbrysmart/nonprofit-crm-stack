import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER =
  '02f1cb90-646b-42de-8e77-86d890f7515c';

export const GIFT_AID_CLAIM_SUBMISSION_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '7ec86c50-87dd-4bea-8e88-3108bd14f429';

export const GIFT_AID_CLAIM_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '3681e09f-0d37-431f-98b1-b8ca0ed5a9d6';

export const GIFT_AID_CLAIM_SUBMISSION_ENVIRONMENT_FIELD_UNIVERSAL_IDENTIFIER =
  '584d8797-9e40-4eca-b9c2-0686644a36e4';

export const GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'd879f989-6a11-4e9f-9c4f-80c90c0547c0';

export const GIFT_AID_CLAIM_SUBMISSION_SUBMITTED_TO_HMRC_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '1d8e4dbf-d7a3-4a80-a1c1-9f25838f3220';

export const GIFT_AID_CLAIM_SUBMISSION_LAST_POLLED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'da223b0d-9d2a-4b53-b368-6793ed9b4e5f';

export const GIFT_AID_CLAIM_SUBMISSION_COMPLETED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '48e7db76-2120-4501-8562-f2e0e95436ab';

export const GIFT_AID_CLAIM_SUBMISSION_CORRELATION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '49ee2ab8-c5ef-4bdc-8183-1dcad3277327';

export const GIFT_AID_CLAIM_SUBMISSION_TRANSACTION_ID_FIELD_UNIVERSAL_IDENTIFIER =
  'c0f55e47-facb-49d3-a5ab-70071d6dd399';

export const GIFT_AID_CLAIM_SUBMISSION_FAILURE_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  '529feac8-d59e-4f31-8523-8ae4c4aaf165';

export const GIFT_AID_CLAIM_SUBMISSION_FAILURE_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER =
  '18f0b0d3-8a81-4630-ac34-3e6e547f2109';

export const GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  'c0f91cf7-3d84-49ec-86cf-04d2d62304bb';

export const GIFT_AID_CLAIM_SUBMISSION_SNAPSHOT_HASH_FIELD_UNIVERSAL_IDENTIFIER =
  '1f99f464-b574-4ed0-bd97-f5255bb5f775';

export const GIFT_AID_CLAIM_SUBMISSION_RESPONSE_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  '25e4577c-2c85-4a53-b48d-3cb3649c0761';

export const GIFT_AID_CLAIM_SUBMISSION_ERROR_SUMMARY_JSON_FIELD_UNIVERSAL_IDENTIFIER =
  'f6b2ce66-cf9d-488a-9b4a-dd268a476cdd';

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
