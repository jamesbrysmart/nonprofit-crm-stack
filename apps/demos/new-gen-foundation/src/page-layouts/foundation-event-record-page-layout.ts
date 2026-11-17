import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';
import { EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/event-guests-on-foundation-event.field';
import { GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-foundation-event.field';

export default definePageLayout({
  universalIdentifier: '528a650b-fec2-4ddd-979a-d71762735d4e',
  name: 'Default Event Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  tabs: [
    {
      universalIdentifier: 'e558a333-7426-482d-8bf8-85e0a6a11dbe',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '8e36192b-87e4-44e2-952a-6ba61af972cb',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'edbc8827-d227-4beb-aa73-6150ca55fd2a',
          },
        },
        {
          universalIdentifier: 'ea439c65-26a0-4f7c-b505-cc294bd3ff2f',
          title: "Guests",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: EVENT_GUESTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: 'dcd01ca3-5274-4a3a-b045-e794d89fa39c',
          title: "Gifts",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFTS_ON_FOUNDATION_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: '49f5c6fc-05c0-42ec-827a-e779ccd10962',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3e83a0ad-5307-4d3d-bed8-c505584b295b',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: '1af63ab2-f66a-4e0c-9687-e73ab58fa4d5',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3136b3d5-e1e9-4ae6-bc48-8a7b83da5dd3',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
