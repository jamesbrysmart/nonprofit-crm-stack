import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk';
import { GIFT_AID_CLAIM_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-record';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';

export default definePageLayout({
  universalIdentifier: 'd83d8f69-2f91-49ab-9504-cb39772644d0',
  name: 'Gift Aid Claim Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'cbfe8982-a685-46f6-9337-9d11b1df0c60',
      title: 'Claim workspace',
      position: 0,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '3382d9fb-b34b-45e6-a356-f808d5e54359',
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
      universalIdentifier: '2f667c3e-8afb-45c8-9425-95b4a5f3954d',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3e48fca1-929e-42cc-89bf-669ce1198c98',
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
