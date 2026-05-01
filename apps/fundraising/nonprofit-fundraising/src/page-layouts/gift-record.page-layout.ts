import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-declaration.front-component';
import { GIFT_GIFT_AID_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-donor-context.front-component';
import { GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-gift-aid-state.front-component';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

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
          universalIdentifier: '590783d4-e1c3-4970-a8fe-f791f6105fab',
          title: 'Gift fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '9ca49f06-b3ea-4dc2-b507-4e312f84c31d',
      title: 'Gift Aid',
      position: 20,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '2b6ab7ff-779c-4f75-8e02-46e40f9181f9',
          title: 'Gift Aid state',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '12f97aa3-53d2-4d8c-8e77-3cd1290b0af3',
      title: 'Gift Aid v2',
      position: 21,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '9d9ad5b9-b417-4dd6-9f42-716df2a7afb5',
          title: 'Gift Aid state',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '9fe04d99-136d-4413-bfe4-6c7bc8a8a8b1',
          title: 'Gift Aid declaration',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '76506dbb-fcae-412e-a7a2-4a8fd79d9bbb',
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
