import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '113e0240-50c9-470c-abeb-340fa9434b82',
  name: 'Default Relationship Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  tabs: [
    {
      universalIdentifier: '5a1dd06b-4678-4526-8709-1735f93f6dc9',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'd1a1c355-3a3f-44d7-aa25-4ab206b1aa41',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '4439ac5e-3c45-425f-ba4d-6420c8657edd',
          },
        },

      ],
    },
    {
      universalIdentifier: '8b76cd30-56a1-49a5-af47-51e4b314cc18',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '279aaa7f-a25e-4370-97c1-5a53a7782804',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: '38736c00-e707-407f-891e-b84875340143',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4e2b106d-3d5f-46ee-8229-ce0f7a2366df',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
