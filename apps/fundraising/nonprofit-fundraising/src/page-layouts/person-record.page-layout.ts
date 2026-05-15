import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/person-record-summary.front-component';

export default definePageLayout({
  universalIdentifier: 'c5052d0a-8b77-43b8-bd92-1314c5827311',
  name: 'Person Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  tabs: [
    {
      universalIdentifier: 'd46cf227-5860-436e-91f7-e4a6a5d30bc6',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '78767058-b8c6-44f4-bdf0-e751b6f8d84f',
          title: 'Person summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '1fb5ca8d-9ffb-46ad-9e8c-b55f439a9462',
      title: 'Details',
      position: 100,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '2bc9f8a5-3554-4e5e-84d5-ebdbf4c57062',
          title: 'Person details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '8f342b53-b0b3-4cc8-b3bf-2f9d528b3cd4',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'fdb38d6c-4c4f-4314-85f7-9f0e706113fb',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '4e503b35-f527-4e38-9172-cda097f8d1a3',
      title: 'Tasks',
      position: 300,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '8f62fc4a-c490-4061-b915-f49755f0ee9f',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: '3b061eb9-a702-4d2d-9374-0ee65dc0cb54',
      title: 'Notes',
      position: 400,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'ec577e01-513c-4d83-b6d0-d7f4925e0253',
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
