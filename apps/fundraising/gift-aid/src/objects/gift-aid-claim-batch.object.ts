import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_LATEST_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaimBatch',
  namePlural: 'giftAidClaimBatches',
  labelSingular: 'Gift Aid claim batch',
  labelPlural: 'Gift Aid claim batches',
  description:
    'Current draft and historical Gift Aid claim groupings for operational review.',
  isUICreatable: false,
  disabledObjectPermissionActions: [
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
  icon: 'IconReceiptTax',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconListCheck',
      defaultValue: "'DRAFT'",
      options: [
        {
          id: '51090e7b-392b-47dd-84e9-00ce29fd4280',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: 'b70340e1-4466-4c7a-b7a9-73b90510ae2f',
          value: 'FINALIZED',
          label: 'Finalized',
          position: 1,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'submittedAt',
      label: 'Finalized at',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_LATEST_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'latestSubmissionStatus',
      label: 'Latest submission status',
      icon: 'IconSend',
      isNullable: true,
      defaultValue: null,
      options: [
        {
          id: '4795f5c6-fad2-4c1a-8273-268652758f79',
          value: 'QUEUED',
          label: 'Queued',
          position: 0,
          color: 'gray',
        },
        {
          id: '96d06dfe-24ef-4357-bd93-9d567011ff98',
          value: 'BUILT',
          label: 'Built',
          position: 1,
          color: 'blue',
        },
        {
          id: '58152f4b-0858-4398-bd4a-df3cd6ed341b',
          value: 'ACKNOWLEDGED',
          label: 'Acknowledged',
          position: 2,
          color: 'yellow',
        },
        {
          id: '43ebb3e6-d438-4b2a-8c3d-2ebd1b0b0273',
          value: 'AWAITING_RESPONSE',
          label: 'Awaiting response',
          position: 3,
          color: 'orange',
        },
        {
          id: 'aa1b5287-4dd2-4791-b13a-7897f5b40c72',
          value: 'RESPONDED',
          label: 'Responded',
          position: 4,
          color: 'green',
        },
        {
          id: '657ec72a-e9e6-42eb-857a-36562f41ea77',
          value: 'FAILED',
          label: 'Failed',
          position: 5,
          color: 'red',
        },
        {
          id: 'd47f7339-cbb9-498b-9e47-b6b90a2a493d',
          value: 'TIMED_OUT',
          label: 'Timed out',
          position: 6,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'giftCount',
      label: 'Gift count',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'totalAmount',
      label: 'Total amount',
      icon: 'IconCurrencyPound',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'hasBlockingIssues',
      label: 'Has blocking issues',
      icon: 'IconAlertTriangle',
      defaultValue: false,
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'blockingIssueCount',
      label: 'Blocking issue count',
      icon: 'IconHash',
      defaultValue: 0,
    },
  ],
});
