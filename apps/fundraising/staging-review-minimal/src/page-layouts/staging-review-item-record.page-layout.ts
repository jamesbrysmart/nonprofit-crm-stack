import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk';
import { STAGING_REVIEW_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/staging-review-record';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export default definePageLayout({
  universalIdentifier: 'a426b4ee-4def-4e96-ad5a-0f623c64385c',
  name: 'Staging Review Item Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '3003360d-f531-439a-99e6-b8421efbde10',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'cbe863ba-c33b-4078-95ca-d9c63489e9b9',
          title: 'Record review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              STAGING_REVIEW_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '6f37d5c4-2437-4755-ac97-9c794730387e',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'ab7c24f7-48c7-442d-ac6a-d0a5762c2a55',
          title: 'Staging review fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
