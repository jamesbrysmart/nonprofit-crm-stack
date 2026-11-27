import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '685ddf83-9548-4baf-8ff3-e264e466f84f',
  name: 'Gift Aid declaration',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '9400837c-8f41-4c6d-8ecf-4fd1228eaaf5',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '03879aaf-9614-4afa-ab19-e3a936ef67c7',
          title: 'Gift Aid declaration',
          type: 'FIELDS',
          configuration: { configurationType: 'FIELDS' },
        },
      ],
    },
  ],
});
