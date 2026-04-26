import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER =
  'b4fc6f98-06ad-4de6-9f65-018758ce6908';

export const GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'c33dcc27-0720-4d1d-9055-cc2187f3a1d2';

export const GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '0fbd02f4-8c3d-449d-a5b6-f0f2997c7d98';

export const GIFT_BATCH_TOTAL_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  '4f8d356f-b86c-4f4f-88d0-8a8504d8dffb';

export const GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  '8b68efff-00df-49b7-bb55-7256afb59f42';

export const GIFT_BATCH_FAILED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER =
  '5bd95ca3-6d14-4e46-af13-dbc92da5b59d';

export default defineObject({
  universalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftBatch',
  namePlural: 'giftBatches',
  labelSingular: 'Gift batch',
  labelPlural: 'Gift batches',
  description:
    'Minimal batch scope object for staged-gift processing proof inside Twenty apps.',
  icon: 'IconStack2',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable label for the processing batch',
      icon: 'IconAbc',
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
          id: '4bf5eca5-63df-4e58-a976-b69906f46f68',
          value: 'PENDING',
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: 'd48f77d8-2f6d-4d0f-9366-7a71f507b2df',
          value: 'PROCESSING',
          label: 'Processing',
          position: 1,
          color: 'yellow',
        },
        {
          id: '32b5b0f8-6887-436d-bf37-b22d4512d689',
          value: 'PROCESSED',
          label: 'Processed',
          position: 2,
          color: 'green',
        },
        {
          id: 'fbd0c7b4-ec93-4af9-af02-2d79dc2aaea2',
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
      description: 'How many staged rows belong to this batch',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'processedItems',
      label: 'Processed items',
      description: 'How many rows in the batch have been committed',
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
