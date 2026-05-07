import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-audit.front-component';
import { GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-donor-review.front-component';
import { GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-processing.front-component';
import { GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-record.front-component';
import {
  GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift-staging.object';
import { GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-staging-review-core.view';

const FULL_WIDTH = { column: 0, columnSpan: 12 } as const;
const LEFT = { column: 0, columnSpan: 6 } as const;
const RIGHT = { column: 6, columnSpan: 6 } as const;
const THIRD_LEFT = { column: 0, columnSpan: 4 } as const;
const THIRD_MIDDLE = { column: 4, columnSpan: 4 } as const;
const THIRD_RIGHT = { column: 8, columnSpan: 4 } as const;

export default definePageLayout({
  universalIdentifier: '87c09c20-bbb4-4fa5-b54d-bdb6f9e5e33f',
  name: 'Gift Staging Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '3c663d20-3dfd-4679-abe4-30eaa09d804e',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'a9d5a841-da99-4b89-90f3-e6365896b555',
          title: 'Gift staging review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'c5a25f61-3881-4d15-919e-1046259683db',
          title: 'Donor review',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '2922e7de-d1fb-4f9e-96cc-491042ba0151',
          title: 'Processing',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '5f0088fe-4674-412d-9614-21cc8c9476bb',
      title: 'Details',
      position: 50,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: '04951baa-0a93-47e8-bfaa-7787a3c8f3c0',
          title: 'Provider',
          type: 'FIELD',
          gridPosition: { row: 0, ...THIRD_LEFT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '1826d41e-32cf-4c01-9aa5-3b8c9ef3b785',
          title: 'External ID',
          type: 'FIELD',
          gridPosition: { row: 0, ...THIRD_MIDDLE, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '83d0de31-8dd8-49da-b35f-219e736fef49',
          title: 'Processing status',
          type: 'FIELD',
          gridPosition: { row: 0, ...THIRD_RIGHT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '8924fdb3-53d6-43dd-b63f-60e91f1b2d4b',
          title: 'Provider payment ID',
          type: 'FIELD',
          gridPosition: { row: 2, ...THIRD_LEFT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '4fa8cc50-76de-42fd-bd79-b4a85c1ce61d',
          title: 'Provider agreement ID',
          type: 'FIELD',
          gridPosition: { row: 2, ...THIRD_MIDDLE, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: 'f6ed1758-7378-4dd4-a876-9f047ca1f08a',
          title: 'Source fingerprint',
          type: 'FIELD',
          gridPosition: { row: 2, ...THIRD_RIGHT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '96739b81-2feb-4ab6-8fa5-edb1cafc2418',
          title: 'Core gift fields',
          type: 'FIELDS',
          gridPosition: { row: 4, ...FULL_WIDTH, rowSpan: 6 },
          configuration: {
            configurationType: 'FIELDS',
            viewId: GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '54a93886-f86c-48fc-b543-889f03064a95',
      title: 'Audit',
      position: 100,
      icon: 'IconInfoCircle',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: '1bfe65a2-7fa8-4412-b7f3-a34c5a28e4bf',
          title: 'Gift staging audit',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, ...FULL_WIDTH, rowSpan: 7 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '6220f3ae-b34e-40af-bf79-a4b5429ec6d2',
          title: 'Processing status',
          type: 'FIELD',
          gridPosition: { row: 7, ...THIRD_LEFT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: 'b557df26-ae7a-45ec-857d-8200b458ed2d',
          title: 'Provider payment ID',
          type: 'FIELD',
          gridPosition: { row: 7, ...THIRD_MIDDLE, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROVIDER_PAYMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: 'e8807904-f72e-4df4-a355-1caf15ce4f1a',
          title: 'Provider agreement ID',
          type: 'FIELD',
          gridPosition: { row: 7, ...THIRD_RIGHT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_PROVIDER_AGREEMENT_ID_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: '3bc0cf3b-a327-417b-a368-586a963d95eb',
          title: 'Source fingerprint',
          type: 'FIELD',
          gridPosition: { row: 9, ...LEFT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              GIFT_STAGING_SOURCE_FINGERPRINT_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'CARD',
          },
        },
        {
          universalIdentifier: '5950db30-31f7-49fe-ab14-18e95892f700',
          title: 'Last error detail',
          type: 'FIELD',
          gridPosition: { row: 9, ...RIGHT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'CARD',
          },
        },
      ],
    },
  ],
});
