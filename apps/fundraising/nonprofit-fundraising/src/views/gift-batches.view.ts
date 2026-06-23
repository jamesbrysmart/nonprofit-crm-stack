import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-batch.object';

export const GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER =
  '8b8234af-6d83-4fdd-b926-790f6c14ca93';

export default defineView({
  universalIdentifier: GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift batches',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconStack2',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'e4467de3-b8fa-41e7-9174-143965e7be9f',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'f079966f-e611-4ff4-8a53-d079c70731a1',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'aeaea922-4e37-4403-90ba-e359f0e82c1b',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0f60b63c-cdc2-4cee-a2e8-69ecf5889a2b',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_PROCESSED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '7414132d-865f-4caa-b10d-cf89484dc5db',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_FAILED_GIFTS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 120,
    },
  ],
});
