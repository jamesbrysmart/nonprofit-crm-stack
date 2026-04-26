import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-record.front-component';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';

export default definePageLayout({
  universalIdentifier: 'cd39d1d5-9de1-471a-ab9f-09166f8ea4b0',
  name: 'Gift Aid Claim Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '283757ae-faf2-4f5c-8d44-0e47313fd90f',
      title: 'Workspace',
      position: 0,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '77a67309-ef96-47d8-b6ef-61e5df99d5fa',
          title: 'Gift Aid claim workspace',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '1dc03511-6e30-48b1-a89e-f3011b457786',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b4fbfd64-8fa8-4967-88d2-53351439ea38',
          title: 'Gift Aid claim batch fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
