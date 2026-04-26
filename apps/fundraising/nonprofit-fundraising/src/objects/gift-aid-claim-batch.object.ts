import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER =
  '7aa48cf5-cdc8-4c6a-b2b7-4a2c50612325';

export const GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '0c7b8271-51d3-4666-b4f8-57a3e05e5830';

export const GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'b670e5df-4b53-4cb1-ab9f-a21e0c2a8c12';

export const GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '22017f13-1f56-4070-9d9f-7c2501da262f';

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
          id: '51e2200c-fa4c-4055-97ff-c6930eb82ea6',
          value: 'SUBMITTING',
          label: 'Submitting',
          position: 1,
          color: 'yellow',
        },
        {
          id: '0b20a57a-889b-463d-b81f-91f540e35777',
          value: 'SUBMITTED',
          label: 'Submitted',
          position: 2,
          color: 'green',
        },
        {
          id: 'c5857f38-7a41-4f3f-99cc-fecad68f7828',
          value: 'SUBMISSION_FAILED',
          label: 'Submission failed',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'submittedAt',
      label: 'Submitted at',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
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
