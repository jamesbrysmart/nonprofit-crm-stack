import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { RECURRING_AGREEMENT_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/recurring-agreement-donor-context.front-component';
import { RECURRING_AGREEMENT_LINKED_GIFTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/recurring-agreement-linked-gifts.front-component';
import { RECURRING_AGREEMENT_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/recurring-agreement-state.front-component';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export default definePageLayout({
  universalIdentifier: '75ed715c-b8f5-4218-9574-7592266065d7',
  name: 'Recurring Agreement Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '23039716-a6a8-42c6-8ba7-ee56e0b1bcd7',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'ca574f31-8d81-474e-977b-24f74cb26c38',
          title: 'Recurring state',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              RECURRING_AGREEMENT_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '93a85058-6fd1-4254-83c2-c86073a59d51',
          title: 'Donor context',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              RECURRING_AGREEMENT_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '8ecdf1f8-5b94-45e6-9158-1796efc29777',
          title: 'Linked gifts',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              RECURRING_AGREEMENT_LINKED_GIFTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '6004320f-5807-43a8-b3d2-7f0216e232f6',
      title: 'Fields',
      position: 100,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f49e89e7-4be6-49ca-9551-33a2a9fd2261',
          title: 'Recurring agreement fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '6c6135d0-b81c-454d-8237-3c9fe835f4ae',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '704d5052-e27c-4528-9244-7c3f579a2675',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '3f163f00-3ed0-448f-b5c2-55ef7cbf49d7',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '9b99661c-edf4-4530-a08c-756e0a6988cf',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
  ],
});
