import { defineObject, FieldType } from 'twenty-sdk/define';
import {
  GIFT_BATCH_EXPECTED_ITEM_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_EXPECTED_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftBatch',
  namePlural: 'giftBatches',
  labelSingular: 'Gift batch',
  labelPlural: 'Gift batches',
  description:
    'Grouped intake and review scope for staged fundraising gifts.',
  icon: 'IconStack2',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable label for the batch',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'source',
      label: 'Source',
      description: 'Primary or intended intake source label for the batch',
      icon: 'IconArrowDown',
    },
    {
      universalIdentifier: GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconListCheck',
      defaultValue: "'PENDING'",
      options: [
        {
          id: 'c9401032-2d09-47e2-b697-454f7768f8f2',
          value: 'PENDING',
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: '97230882-7fcc-457f-9073-c2b4be84f18a',
          value: 'PROCESSING',
          label: 'Processing',
          position: 1,
          color: 'yellow',
        },
        {
          id: '08bbccf2-a696-49ca-afae-c0bcf98cdcfd',
          value: 'PROCESSED',
          label: 'Processed',
          position: 2,
          color: 'green',
        },
        {
          id: '694c306d-df56-4141-95a8-b0ff21dbf9a6',
          value: 'PROCESSED_WITH_ISSUES',
          label: 'Processed with issues',
          position: 3,
          color: 'orange',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'processedGifts',
      label: 'Processed gifts',
      description: 'How many gifts were committed by batch processing',
      icon: 'IconCheck',
      defaultValue: 0,
    },
    {
      universalIdentifier: GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'failedGifts',
      label: 'Failed gifts',
      description: 'How many gifts failed during batch processing',
      icon: 'IconAlertTriangle',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        GIFT_BATCH_EXPECTED_ITEM_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'expectedItemCount',
      label: 'Expected item count',
      description:
        'Expected number of gifts in the batch for offline reconciliation',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_BATCH_EXPECTED_TOTAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'expectedTotalAmount',
      label: 'Expected total amount',
      description:
        'Expected total batch value for offline reconciliation checks',
      icon: 'IconCurrencyPound',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
