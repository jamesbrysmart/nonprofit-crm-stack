import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-actions.front-component';
import { GIFT_AID_CLAIM_BATCH_SUBMISSION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-submission.front-component';
import { GIFT_AID_CLAIM_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-summary.front-component';
import { GIFT_AID_CLAIM_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-aid-claim-batch-worklists.front-component';
import { GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-claim-batch.object';

export default definePageLayout({
  universalIdentifier: 'cd39d1d5-9de1-471a-ab9f-09166f8ea4b0',
  name: 'Gift Aid Claim Batch Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'fcf1fe12-cf95-4a04-ae28-a97f2f82992a',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '2ff1b81d-aab7-4526-8b3d-fc15093cc7e8',
          title: 'Claim summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '7160c2cd-b26d-473b-ad9c-a6612367a026',
          title: 'Gift worklists',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '18d9a49a-ac6d-4029-8fa3-9f7a6d03737f',
          title: 'Submission status',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_SUBMISSION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '283757ae-faf2-4f5c-8d44-0e47313fd90f',
      title: 'Workspace',
      position: 50,
      icon: 'IconReceiptTax',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '6f28f70a-f0ab-4b5d-85c8-8c9248ba8f2e',
          title: 'Claim summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'b64c7552-5be2-4975-b870-2766b52231da',
          title: 'Primary action',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '1bb1ef8a-9ca5-4eb2-b3f5-a77e552bd9e1',
          title: 'Gift worklists',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_WORKLISTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'f75c2a2e-f1bb-4a63-a7aa-c85e7dadcf86',
          title: 'Submission status',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_AID_CLAIM_BATCH_SUBMISSION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '1dc03511-6e30-48b1-a89e-f3011b457786',
      title: 'Fields',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'b4fbfd64-8fa8-4967-88d2-53351439ea38',
          title: 'Gift Aid claim batch fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '9548e653-5807-45df-9531-e8f4884307d0',
      title: 'Timeline',
      position: 100,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '45dd7e3d-77f4-490b-b6d7-8862b2c5feda',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '8ef9b77d-ea41-42a1-bca6-2d4f030ca732',
      title: 'Tasks',
      position: 150,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '2f78c02b-e364-4d72-8e59-511d53dc7f0b',
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
