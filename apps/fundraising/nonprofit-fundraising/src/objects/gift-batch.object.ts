import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER =
  '1d5f0770-6577-4f28-b7bc-c1d7a6dd65ce';

export const GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f06b6d0a-c896-4205-ae77-a47d8264d7b0';

export const GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '4d301934-c361-4f02-8917-a39cf09cd674';

export const GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '89d10d33-2db8-4ffc-ab9b-4b20bf379758';

export const GIFT_BATCH_TOTAL_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  'ff8a5f27-bcff-4c5d-9344-d663f6f54554';

export const GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  '038c7cd9-09cf-4351-8d2a-f170bb6cfe33';

export const GIFT_BATCH_FAILED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  'f1c6d37b-7d39-4fd4-8a1e-b475e89f7e2d';

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
      description: 'Primary intake source for the batch',
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
      universalIdentifier: GIFT_BATCH_TOTAL_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'totalItems',
      label: 'Total items',
      description: 'How many staged rows belong to the batch',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'processedItems',
      label: 'Processed items',
      description: 'How many rows in the batch are committed',
      icon: 'IconCheck',
      defaultValue: 0,
    },
    {
      universalIdentifier: GIFT_BATCH_FAILED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'failedItems',
      label: 'Failed items',
      description: 'How many rows in the batch currently have processing errors',
      icon: 'IconAlertTriangle',
      defaultValue: 0,
    },
  ],
});
