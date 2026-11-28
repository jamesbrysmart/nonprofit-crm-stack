import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import {
  GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: 'efea5077-df28-4ed8-8c9f-6f6329652fe0',
  name: 'Gift Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'de6ef6fa-4d2d-4f5c-b7af-d98de4782457',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b9b7a4b4-d3e9-4951-aacc-7dd70638d1cb',
          title: 'Gift overview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '4d357ec4-b563-4133-9262-cdb28a30d6df',
      title: 'Details',
      position: 10,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '10b7025a-37c4-4e47-86dd-b4052c2f3d33',
          title: 'Gift details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '1be17e18-4fb6-4471-a7a6-47ccebf16ec8',
      title: 'Refund',
      position: 15,
      icon: 'IconArrowBackUp',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3e56d1c0-87b4-42f4-bfe7-5f1d8ea7e0bb',
          title: 'Refund',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_REFUND_ACTION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '6fca1c27-c8de-4cce-8e65-4bd3fd0bc8ca',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '0a13056f-6109-49b8-a61a-6a47b1af1b8b',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '8d7d984c-5714-44b9-a113-2af3381bb5bf',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '1c5ee980-15f9-4b39-a936-34f21aab04bc',
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
