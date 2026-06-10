import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-audit.front-component';
import { GIFT_STAGING_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-coding.front-component';
import { GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-donor-review.front-component';
import { GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-processing.front-component';
import { GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-record.front-component';
import {
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';
import { GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-staging-review-core.view';

export default definePageLayout({
  universalIdentifier: '87c09c20-bbb4-4fa5-b54d-bdb6f9e5e33f',
  name: 'Gift Staging Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '3c663d20-3dfd-4679-abe4-30eaa09d804e',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'a9d5a841-da99-4b89-90f3-e6365896b555',
          title: 'Gift staging review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'c5a25f61-3881-4d15-919e-1046259683db',
          title: 'Donor review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '2922e7de-d1fb-4f9e-96cc-491042ba0151',
          title: 'Gift coding',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '1f047388-0331-413b-8d96-576dc6919140',
          title: 'Processing',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'c2905869-2c0a-4ace-8f2a-8e7d7d7d339b',
      title: 'Details v2',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '9244d8bd-cb9a-4b0f-a292-513f0b1ccb2c',
          title: 'Core gift fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier:
              GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '34d2123d-a4f8-490d-af48-94c77cb72818',
      title: 'Audit',
      position: 100,
      icon: 'IconInfoCircle',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '74b4c948-af96-4c43-a41c-c1704f33c6f1',
          title: 'Gift staging audit',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
