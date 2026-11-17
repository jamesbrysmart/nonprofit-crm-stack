import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';
import { PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-roles-on-programme.field';
import { FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/foundation-events-on-programme.field';
import { OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/opportunities-on-programme.field';
import { FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/funds-on-programme.field';
import { PROGRAMME_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/programme-overview.front-component';

export default definePageLayout({
  universalIdentifier: '3cb7fbf5-4f27-4152-a85a-e7d6e0fbb919',
  name: 'Default Programme Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  tabs: [
    {
      universalIdentifier: 'c48b6be5-017e-47ef-aaeb-b1e1c7640f0c',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'bd9b1d9e-8532-4153-8ab0-07cd6ca2bde7',
          title: 'Programme overview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier: PROGRAMME_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '4fd73fe6-55af-4019-afa2-92e8154d6987',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: 'f6dab703-562e-45aa-a8b6-5470bd0c5d66',
          },
        },
        {
          universalIdentifier: '94dc7fce-3080-4adf-b5b4-ed350324927f',
          title: "Artists and roles",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: PROGRAMME_ROLES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '748fe50e-3aa9-4423-8773-e651e2107665',
          title: "Events",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: FOUNDATION_EVENTS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '253be05f-ae7d-413c-be45-41e8a7862a48',
          title: "Opportunities",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: 'ba4c269e-e54b-4fc3-bb27-ce6e15ef00a6',
          title: "Funds",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: FUNDS_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'a8bd76eb-46bf-487f-9502-30c776d1be10',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'fc4173d6-c810-4635-87de-79a42f95812d',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: '03c846b3-a418-437a-a4ca-fda5dca41899',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '9e48a994-adff-426b-9a49-8433f7c986ce',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
