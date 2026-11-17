import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '751d974c-dd42-4769-b209-542ffb6975a7',
  name: 'Default Programme Role Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  tabs: [
    {
      universalIdentifier: 'a3b5ec98-93a1-4de1-bd64-8ae3027f47cb',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3280c6a5-d700-4bbe-b5ea-38738ae85990',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '82fc30aa-8a2e-4665-b960-7ab46de60bf5',
          },
        },

      ],
    },
    {
      universalIdentifier: '9e2df86a-7ca1-4f70-b32b-0d878be80461',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f7cda7f1-9fb9-4a26-924a-5847a7495bae',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: 'c8129233-4219-4576-8bbf-fc7e1bb0fc20',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b5085639-4467-4f56-a1ee-877300094169',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
