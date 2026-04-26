import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-batch-record.front-component';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export default definePageLayout({
  universalIdentifier: 'c8ea69b3-6fcb-44cc-a22a-3ef95cb6ec85',
  name: 'Gift Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '4a46465c-5f40-494d-aac2-48d11b241ad8',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c502ed99-5f1b-48ef-9711-f00ad572f42f',
          title: 'Gift batch review',
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
      universalIdentifier: 'dbf57088-cb16-41c7-b7eb-c6c5c21028c4',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '38c94b80-e487-42d7-9970-6f16ff50b442',
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
