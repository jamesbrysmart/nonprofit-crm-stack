import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/appeal-summary.front-component';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/appeal-details.view';

export default definePageLayout({
  universalIdentifier: '4b9dc275-8078-486a-97fb-dfe2f4557010',
  name: 'Appeal Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'bf71b6c7-7bf1-4c37-ac37-8472b87f5f95',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'cbce0579-2406-4124-96cb-83dbe61dd6aa',
          title: 'Appeal summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              APPEAL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '0f4d2d6b-ec8f-475f-96a7-4b93e8db3f79',
      title: 'Details',
      position: 100,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '9f39ef25-0fba-4cd2-af38-fdf901f7b615',
          title: 'Appeal details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewId: APPEAL_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '6fd1b8d6-f66a-4766-a517-dc68bf25587a',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '8dfa88c7-1ca1-45d0-84ca-03f7709e9de1',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'aedc7e3e-7362-4a0c-ab98-d7f6e1efddcb',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '37c97f95-4d9d-4d0d-9e79-6ddd779459f2',
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
