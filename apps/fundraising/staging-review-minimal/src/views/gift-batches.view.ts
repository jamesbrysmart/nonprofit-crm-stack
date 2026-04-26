import { defineView, ViewKey } from 'twenty-sdk';
import {
  GIFT_BATCH_FAILED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_TOTAL_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-batch.object';

export const GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER =
  '84cc47b0-888d-4f85-a2d1-21b1c597f8e4';

export default defineView({
  universalIdentifier: GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift batches',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconStack2',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '247e59be-d0bb-43c7-9a53-fe54fd3336f0',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '8016e776-d8e1-44e6-b43d-e35bcc5c95bf',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd7e0ec55-4caf-4688-81ce-e5a6d961c95f',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_TOTAL_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '0d23be3d-c1a8-457b-9110-b31c8d5701a2',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_PROCESSED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '623b3e53-e685-4bd2-946a-ae5aa25eb149',
      fieldMetadataUniversalIdentifier:
        GIFT_BATCH_FAILED_ITEMS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
  ],
});
