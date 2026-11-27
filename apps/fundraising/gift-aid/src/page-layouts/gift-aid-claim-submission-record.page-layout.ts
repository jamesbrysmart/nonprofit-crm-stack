import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '897cc1f5-0241-47a2-b368-0b0cc9dfd5fd',
  name: 'Gift Aid claim submission',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '80bc8d38-a1cc-4602-809f-6870cba01856',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '2a8e93f0-7818-46ad-9753-680f45b39130',
          title: 'Gift Aid claim submission',
          type: 'FIELDS',
          configuration: { configurationType: 'FIELDS' },
        },
      ],
    },
  ],
});
