import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER =
  '4cc57b2b-7970-4c34-b1d3-2fc3347d72fb';

export const GIFT_AID_CLAIM_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '08e2a3df-9be7-4a95-aa69-d6a8834163c7';

export const GIFT_AID_CLAIM_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '4d240d48-8c7e-49da-95de-295f77c89de9';

export const GIFT_AID_CLAIM_BATCH_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'c09f8d27-997f-4f9b-b2d9-8a959d831f2e';

export const GIFT_AID_CLAIM_BATCH_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'c5e91224-0274-47a0-98ba-17d704a62b06';

export const GIFT_AID_CLAIM_BATCH_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '1960c537-b802-47b5-ac52-2d35a15f0fe4';

export const GIFT_AID_CLAIM_BATCH_HAS_BLOCKING_ISSUES_FIELD_UNIVERSAL_IDENTIFIER =
  '7b060e14-5bbb-45bc-b5df-1ef7cb19cd2e';

export const GIFT_AID_CLAIM_BATCH_BLOCKING_ISSUE_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '8e29609e-eb59-40cf-8b33-fdfcc48a6776';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaimBatch',
  namePlural: 'giftAidClaimBatches',
  labelSingular: 'Gift Aid claim batch',
  labelPlural: 'Gift Aid claim batches',
  description:
    'Draft/submitted Gift Aid claim grouping for claim review and submission probing.',
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
          id: '17d0d623-6811-4849-b540-a5d48d0345a9',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '5aa56b56-fc16-42d0-9167-d714f6b9e4f7',
          value: 'SUBMITTING',
          label: 'Submitting',
          position: 1,
          color: 'yellow',
        },
        {
          id: 'b7512812-f9ad-4ea7-89ce-44d14d340ff8',
          value: 'SUBMITTED',
          label: 'Submitted',
          position: 2,
          color: 'green',
        },
        {
          id: '22877d82-2c63-4c84-aa9f-f4fa134dfee0',
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
  ],
});
