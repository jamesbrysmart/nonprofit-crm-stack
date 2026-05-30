import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';
import { APPEAL_SOURCE_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/appeal-source-details.view';
import { APPEAL_SOURCE_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/appeal-source-home-core.view';

export default definePageLayout({
  universalIdentifier: 'd1cd6ed6-8147-4bfa-80e9-dd13a7740d37',
  name: 'Appeal Source Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'cbe0c2f8-20a9-4bbd-b5d3-85f03790dc20',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3138088e-0c0f-4e11-b7fe-07df0c30af1e',
          title: 'Appeal source summary',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewId: APPEAL_SOURCE_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '5e9db30a-0d6d-4b76-aad8-cda26c74979d',
      title: 'Details',
      position: 100,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '6f640a06-85f0-4313-a6d7-c0d8f38c6aa4',
          title: 'Appeal source details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewId: APPEAL_SOURCE_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '3179df61-c5c8-428b-9068-6240ee6e1d8a',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '6589fe25-c617-4a69-b994-a1c178eab727',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'a9c07f4f-411b-4ca8-b6ee-f9a1c4c89104',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '6caf8896-8d7d-4da0-b93a-0f6a9e52c342',
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
