import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-audit.front-component';
import { GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-donor-review.front-component';
import { GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-processing.front-component';
import { GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/gift-staging-record.front-component';
import {
  GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
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
      universalIdentifier: 'ce4206be-b253-4026-8a48-6cbdf0d4c0b8',
      title: 'Review',
      position: 0,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'ce9f5c9f-6922-4385-9e2f-7c0b4ed5fa6c',
          title: 'Gift staging review',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, ...FULL_WIDTH, rowSpan: 4 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '7d2bc20b-c2f6-473e-8a31-7d0523f9c351',
          title: 'Donor review',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 4, ...LEFT, rowSpan: 7 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'e8ff9d2a-e87a-4e06-a8eb-8d71fb8dcbf8',
          title: 'Processing',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 4, ...RIGHT, rowSpan: 7 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '71e65cc1-8a2d-4ed0-a7ab-62c8fbd8df7c',
          title: 'Amount',
          type: 'FIELD',
          gridPosition: { row: 11, ...THIRD_LEFT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '2851b9a9-e53f-4972-9060-acf8974fbdaa',
          title: 'Gift date',
          type: 'FIELD',
          gridPosition: { row: 11, ...THIRD_MIDDLE, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '79f882b2-98e3-46da-bc28-f8685fc956bb',
          title: 'Intake source',
          type: 'FIELD',
          gridPosition: { row: 11, ...THIRD_RIGHT, rowSpan: 2 },
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: GIFT_STAGING_INTAKE_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'FIELD',
          },
        },
      ],
    },
    {
      universalIdentifier: '2d95f6f3-1125-4515-b1a9-6dfcc5b1ec97',
      title: 'Review v2',
      position: 10,
      icon: 'IconChecklist',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'd8cb2cef-8406-4aa6-bb09-63c45d95f19d',
          title: 'Gift staging review',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, ...FULL_WIDTH, rowSpan: 4 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'd1c12c60-eeef-48ac-a120-a0387a07e097',
          title: 'Donor review',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 4, ...LEFT, rowSpan: 7 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '4f3149cc-a22c-4fbb-892e-1dc5df13ec2a',
          title: 'Processing',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 4, ...RIGHT, rowSpan: 7 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              GIFT_STAGING_PROCESSING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'ec4c2f13-af8f-4554-afeb-536d95fa97c2',
          title: 'Core gift fields',
          type: 'FIELDS',
          gridPosition: { row: 11, ...FULL_WIDTH, rowSpan: 6 },
          configuration: {
            configurationType: 'FIELDS',
            viewId: GIFT_STAGING_REVIEW_CORE_VIEW_UNIVERSAL_IDENTIFIER,
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
          universalIdentifier: '6dfbf8ce-b859-4e35-a8d2-a98f1a664d38',
          title: 'All staged gift fields',
          type: 'FIELDS',
          gridPosition: { row: 4, ...FULL_WIDTH, rowSpan: 8 },
          configuration: {
            configurationType: 'FIELDS',
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
