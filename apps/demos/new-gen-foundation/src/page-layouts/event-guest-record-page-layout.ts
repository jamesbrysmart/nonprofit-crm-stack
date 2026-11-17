import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: 'cff6e7a5-4e4b-4474-9304-fae7ca13dab2',
  name: 'Default Event Guest Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  tabs: [
    {
      universalIdentifier: '07c17b02-d43c-4e73-9c1f-3f30b3523eae',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f8672d75-4816-48d8-aa9c-1dd66dfe9e10',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'bfbd5b6a-9664-4e62-a810-51d9ab49d3ca',
          },
        },

      ],
    },
    {
      universalIdentifier: '616e8389-6124-4ed1-b9d4-0677e7888ee2',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '20361d22-04f2-4ca4-bec7-c968c721c4c6',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: 'ec414008-3c1c-4072-aeee-d75c9d3882f4',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'fd8d1989-a59c-4476-a951-bc32db52dde6',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
