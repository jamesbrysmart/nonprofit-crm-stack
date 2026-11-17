import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';
import { GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-membership.field';

export default definePageLayout({
  universalIdentifier: '20bfed9b-fbb7-464e-b789-cd1ea8cd3d20',
  name: 'Default Membership Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  tabs: [
    {
      universalIdentifier: '12de525d-fdf0-49a3-8449-17c9a64eaf04',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '40ec4ccf-b231-4bd2-a313-d40cfb202664',
          title: 'Details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '67924c0c-ec4d-4e79-8f76-29bcb36aa85b',
          },
        },
        {
          universalIdentifier: '88c38818-b7ac-43a1-bad9-abf2782e4614',
          title: "Membership payments",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFTS_ON_MEMBERSHIP_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: '0fc61eab-eea7-406a-bd70-ca2851b3e3d9',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'cd16037d-4957-41f4-ba31-1bd697885a67',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: { configurationType: 'TIMELINE' },
        },
      ],
    },
    {
      universalIdentifier: '6202bd4b-18b0-4521-b904-9da69b530f6b',
      title: 'Notes',
      position: 30,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f4ee09b5-7e40-4e59-a08e-2c3d37763098',
          title: 'Notes',
          type: 'NOTES',
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
});
