import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_SUBMISSION_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-submission-record.front-component';
import { GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-submission.object';

export default definePageLayout({
  universalIdentifier: 'd0fe2f42-c1b5-4144-bdad-629fa766bf3e',
  name: 'Gift Aid Claim Submission Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_SUBMISSION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '1f2f65eb-0e0d-4f08-b7dd-3dd41eb28e10',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4dcc975d-d4d2-4310-bd44-f1cfc8add45f',
          title: 'Submission history',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_SUBMISSION_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'eeb33179-18d4-4784-bde5-9ab1490af89b',
      title: 'History',
      position: 50,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '440fa561-1f1d-4314-bf07-b6d69f95186b',
          title: 'Submission history',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_SUBMISSION_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
