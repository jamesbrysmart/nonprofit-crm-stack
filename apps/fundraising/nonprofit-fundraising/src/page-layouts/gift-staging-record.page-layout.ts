import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-record.front-component';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export default definePageLayout({
  universalIdentifier: '87c09c20-bbb4-4fa5-b54d-bdb6f9e5e33f',
  name: 'Gift Staging Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'ce4206be-b253-4026-8a48-6cbdf0d4c0b8',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'f29ba8c5-ccf5-4ea7-b59e-8fca09fd5d4b',
          title: 'Gift staging review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '5f0088fe-4674-412d-9614-21cc8c9476bb',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '6dfbf8ce-b859-4e35-a8d2-a98f1a664d38',
          title: 'Gift staging fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
