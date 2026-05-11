import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER =
  '7aa48cf5-cdc8-4c6a-b2b7-4a2c50612325';

export const GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '0c7b8271-51d3-4666-b4f8-57a3e05e5830';

export const GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'b670e5df-4b53-4cb1-ab9f-a21e0c2a8c12';

export const GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '22017f13-1f56-4070-9d9f-7c2501da262f';

export const GIFT_AID_CLAIM_BATCH_LATEST_SUBMISSION_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '322860e6-a97d-48b7-a2df-93508ec546d4';

export const GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '42b70a0d-5e6a-4a75-a75a-e12fc61eb2b2';

export const GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '95e26d07-d455-4c38-bfd9-f78fbf5a4f4b';

export const GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER =
  '3cdac48d-c0d5-42fb-89c3-0b035d9fffa9';

export const GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '3d4a5549-b08d-4e4d-9884-c7a46fdd72fb';

export const GIFT_AID_CLAIM_BATCH_NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  'b104c0b9-f36c-459e-85ba-e1a8f8501d30';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaimBatch',
  namePlural: 'giftAidClaimBatches',
  labelSingular: 'Gift Aid claim batch',
  labelPlural: 'Gift Aid claim batches',
  description:
    'Current draft and historical Gift Aid claim groupings for operational review.',
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
          id: 'bcbca4b5-6189-49eb-85a5-651d5ab94937',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '0b20a57a-889b-463d-b81f-91f540e35777',
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
          id: 'dc6cf53e-b9d2-4e22-97e9-477c999e01fc',
          value: 'QUEUED',
          label: 'Queued',
          position: 0,
          color: 'gray',
        },
        {
          id: 'a39544d6-8f41-40ea-924c-8c83bb7dd143',
          value: 'BUILT',
          label: 'Built',
          position: 1,
          color: 'blue',
        },
        {
          id: '5660b47c-a975-4f1f-a768-fdd6d6946dab',
          value: 'ACKNOWLEDGED',
          label: 'Acknowledged',
          position: 2,
          color: 'yellow',
        },
        {
          id: '5f539d8b-645a-4d73-842f-3ed4be823e33',
          value: 'AWAITING_RESPONSE',
          label: 'Awaiting response',
          position: 3,
          color: 'orange',
        },
        {
          id: '7edb6d97-78b7-4303-a8cb-3686a9e8c2a1',
          value: 'RESPONDED',
          label: 'Responded',
          position: 4,
          color: 'green',
        },
        {
          id: '4210dc68-7e6b-4281-8951-621c51fdaf3e',
          value: 'FAILED',
          label: 'Failed',
          position: 5,
          color: 'red',
        },
        {
          id: '95e7722d-ae6b-4ee5-a99b-b812f1b2ab91',
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
    {
      universalIdentifier: GIFT_AID_CLAIM_BATCH_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      icon: 'IconNotes',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
