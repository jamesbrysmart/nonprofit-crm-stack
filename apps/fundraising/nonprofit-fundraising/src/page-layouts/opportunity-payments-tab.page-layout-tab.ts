import {
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
  definePageLayoutTab,
} from 'twenty-sdk/define';
import { GIFTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-opportunity.field';
import { OPPORTUNITY_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/opportunity-record-payment.front-component';

export default definePageLayoutTab({
  universalIdentifier: '4523849a-d123-4bc3-93bc-d5a408197873',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage
      .universalIdentifier,
  title: 'Payments',
  position: 6,
  icon: 'IconGift',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: '9523299b-7b0b-49cf-8404-bc6780c5d6b5',
      title: 'Record payment',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          OPPORTUNITY_RECORD_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: '30d479d7-42ca-4ca5-9faf-32dc5db735bf',
      title: 'Linked gifts',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: GIFTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'FIELD',
      },
    },
  ],
});
