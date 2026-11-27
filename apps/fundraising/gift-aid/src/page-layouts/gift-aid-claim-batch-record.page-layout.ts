import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import {
  GIFTS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: '2a12df71-3116-49ba-9b98-57e5db19bb22',
  name: 'Gift Aid claim batch',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '7da0c08a-a255-43f9-a8d3-cc613c07c755',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '436e3ce0-ab98-4e2d-a861-87789ce6d5ac',
          title: 'Claim actions',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'ce98fdc6-20db-4dba-8b60-bf5c48ac7cea',
          title: 'Claim summary',
          type: 'FIELDS',
          configuration: { configurationType: 'FIELDS' },
        },
        {
          universalIdentifier: '412d6e60-0246-4150-bb4a-1688bbd02d0e',
          title: 'Gifts in this claim',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFTS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
            isUIEditable: false,
          },
        },
        {
          universalIdentifier: '26ef5a6e-b237-4a8d-b17e-ab49048e183c',
          title: 'Submission history',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_AID_CLAIM_SUBMISSIONS_ON_GIFT_AID_CLAIM_BATCH_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
            isUIEditable: false,
          },
        },
      ],
    },
    {
      universalIdentifier: '12633e71-bee3-44c7-b36b-40f0ceb13856',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4e040432-fa3e-4bc5-a241-e14297e47307',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '4c7dc464-92e2-4fee-bd53-5d7f8ed40adb',
      title: 'Tasks',
      position: 150,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'f8b198e6-f643-4fa7-a21f-4b4406895de3',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
  ],
});
