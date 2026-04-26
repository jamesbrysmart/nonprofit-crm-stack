import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk';
import { GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-batch-record';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export default definePageLayout({
  universalIdentifier: '51fd20ab-46a4-4c4b-8411-ebdf562db85e',
  name: 'Gift Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '64bfe84e-10a4-47d5-bef3-a74b85db102f',
      title: 'Batch review',
      position: 0,
      icon: 'IconStack2',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'ff7d3d20-2ca5-4030-9268-7b06f3e2a1bc',
          title: 'Batch processing',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '55dfbc55-e147-47ea-ac88-72f0fd7751a5',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '0224bd2b-8f3a-47f7-8e7a-16122b01cf35',
          title: 'Gift batch fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
