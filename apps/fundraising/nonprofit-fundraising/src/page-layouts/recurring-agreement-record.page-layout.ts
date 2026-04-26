import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { RECURRING_AGREEMENT_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/recurring-agreement-record.front-component';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export default definePageLayout({
  universalIdentifier: '75ed715c-b8f5-4218-9574-7592266065d7',
  name: 'Recurring Agreement Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'a7064ef4-54ee-4530-a8f9-61707e053e9d',
      title: 'Review',
      position: 0,
      icon: 'IconRepeat',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c7a97b0f-8b80-4af8-b9cc-f323214e5d73',
          title: 'Recurring agreement review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              RECURRING_AGREEMENT_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '6004320f-5807-43a8-b3d2-7f0216e232f6',
      title: 'Fields',
      position: 50,
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
  ],
});
