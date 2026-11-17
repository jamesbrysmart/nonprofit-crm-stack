import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import {
  GIFT_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_BATCH_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGINGS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: 'c8ea69b3-6fcb-44cc-a22a-3ef95cb6ec85',
  name: 'Gift Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '4c878159-ff30-4254-8be4-5375138f60c6',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'd8e23602-8e6c-48cf-acfb-f05d1ae54586',
          title: 'Batch workspace',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '5dedb5a4-a19a-44a2-b03a-ec3f05d5270e',
          title: 'Batch summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '7c090dca-254e-46d9-aeca-7fdb0056efa5',
          title: 'Batch actions',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '5fb23f0f-f9d1-471d-8fe2-a90b0650316a',
          title: 'Gift coding',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '2028153c-f90a-42d3-8fd6-c9e80273cd5d',
          title: 'Worklist links',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '1c9032b9-f836-4a0b-9cc1-2b5387331515',
          title: 'Staged gifts',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGINGS_ON_GIFT_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'dbf57088-cb16-41c7-b7eb-c6c5c21028c4',
      title: 'Details',
      position: 50,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '38c94b80-e487-42d7-9970-6f16ff50b442',
          title: 'Gift batch fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: GIFT_BATCH_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '2ea8e687-3ac6-40d5-b6a1-9185a57031fb',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c8140f05-6834-4514-97d1-55cd63236940',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f0a4f9b5-49c7-47b5-bcd7-f8f0e58aa7e5',
      title: 'Notes',
      position: 150,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '43d6275c-bbe2-438c-8802-a59b9e792c31',
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
