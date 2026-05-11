import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-declaration.front-component';
import { GIFT_GIFT_AID_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-donor-context.front-component';
import { GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-state.front-component';
import { GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-refund-action.front-component';
import { GIFT_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-record-summary.front-component';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';
import { GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-details.view';

export default definePageLayout({
  universalIdentifier: 'efea5077-df28-4ed8-8c9f-6f6329652fe0',
  name: 'Gift Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'de6ef6fa-4d2d-4f5c-b7af-d98de4782457',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '62844f82-5730-4cd1-b0ea-ccca054d326f',
          title: 'Gift summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '4d357ec4-b563-4133-9262-cdb28a30d6df',
      title: 'Details',
      position: 10,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '10b7025a-37c4-4e47-86dd-b4052c2f3d33',
          title: 'Gift details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewId: GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '1be17e18-4fb6-4471-a7a6-47ccebf16ec8',
      title: 'Refund',
      position: 15,
      icon: 'IconArrowBackUp',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3e56d1c0-87b4-42f4-bfe7-5f1d8ea7e0bb',
          title: 'Refund',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '3b1dbb79-d032-4fc3-9d7b-0fe76f80f2e1',
      title: 'Gift Aid',
      position: 20,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '8bf4733c-8b45-4b6a-b06c-0efca87c8bf4',
          title: 'Gift Aid state',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'df92092f-5cb8-4621-bd3b-13b78797619d',
          title: 'Gift Aid declaration',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '1b8e0874-91a7-4b22-a8b3-4c7b067f1f6e',
          title: 'Gift Aid donor context',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
