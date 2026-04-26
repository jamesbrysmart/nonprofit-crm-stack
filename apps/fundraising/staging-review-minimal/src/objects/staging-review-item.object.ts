import { defineObject, FieldType } from 'twenty-sdk';

export const STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER =
  'f01f6767-2287-4f6a-a882-bac59fc80fd1';

export const STAGING_REVIEW_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '1be57b69-41d2-4a14-80ce-eb4ce801848b';

export const STAGING_REVIEW_ITEM_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '6d1c3dde-b0b3-4c6c-9f86-371306331df4';

export const STAGING_REVIEW_ITEM_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '4842bcbc-f0be-4fdf-8224-5e4f647fefdc';

export const STAGING_REVIEW_ITEM_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER =
  'c03e3387-eebc-4be7-bb07-c67dfc1fecec';

export const STAGING_REVIEW_ITEM_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '6e17e165-6efd-4bd0-b4c6-819618a8f7ef';

export const STAGING_REVIEW_ITEM_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  'f89330eb-7c33-499a-b004-0f85d9fd5f17';

export const STAGING_REVIEW_ITEM_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  'd4e0c5b5-3178-4638-ad9e-19f7dfafb0f4';

export const STAGING_REVIEW_ITEM_PROCESSING_OUTCOME_FIELD_UNIVERSAL_IDENTIFIER =
  '15b59cd4-e68f-48bf-8290-3d37d943ed76';

export const STAGING_REVIEW_ITEM_HAS_CORE_GIFT_ISSUE_FIELD_UNIVERSAL_IDENTIFIER =
  '24cdd027-f7a1-4c7b-9407-663eed79c98e';

export const STAGING_REVIEW_ITEM_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER =
  '96640e14-7259-4b32-b5ee-00d735790e3d';

export const STAGING_REVIEW_ITEM_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'e6b7068d-3585-4f91-b5c4-0f6b3c1d6a8e';

export const STAGING_REVIEW_ITEM_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER =
  'e58fe40f-b4f9-40c7-b819-0cc9ed899fca';

export const STAGING_REVIEW_ITEM_GIFT_AID_REQUESTED_FIELD_UNIVERSAL_IDENTIFIER =
  '2b63e039-bb88-42c1-bb2d-95b6defdc6ef';

export const STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_CAPTURED_FIELD_UNIVERSAL_IDENTIFIER =
  '9567b487-6957-4986-a60a-a7d2d5ef76a3';

export const STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '0119f5d2-55fe-427f-98b5-efcb9d8d8bad';

export const STAGING_REVIEW_ITEM_GIFT_AID_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER =
  'd511d390-f603-4647-81bd-676085c35b55';

export const STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '7b509d20-13ab-4b9e-b8a6-c4e8f5a503d1';

export const STAGING_REVIEW_ITEM_GIFT_AID_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  'efb03ece-1c0f-4152-8b13-a70b23e9c868';

export default defineObject({
  universalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  nameSingular: 'stagingReviewItem',
  namePlural: 'stagingReviewItems',
  labelSingular: 'Gift staging row',
  labelPlural: 'Gift staging rows',
  description:
    'App-owned gift staging proof records for testing donor resolution inside Twenty apps.',
  icon: 'IconInbox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: STAGING_REVIEW_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Short queue label for the staging row',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_FIRST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorFirstName',
      label: 'Donor first name',
      description: 'Incoming donor evidence first name',
      icon: 'IconUser',
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_LAST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorLastName',
      label: 'Donor last name',
      description: 'Incoming donor evidence last name',
      icon: 'IconUser',
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'donorEmail',
      label: 'Donor email',
      description: 'Incoming donor evidence email',
      icon: 'IconAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: STAGING_REVIEW_ITEM_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'amount',
      label: 'Amount',
      description: 'Display amount for the review queue',
      icon: 'IconCurrencyPound',
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'giftDate',
      label: 'Gift date',
      description: 'Editable staged gift date',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_DONOR_RESOLUTION_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'donorResolutionState',
      label: 'Donor resolution state',
      icon: 'IconUserCheck',
      defaultValue: "'UNREVIEWED'",
      options: [
        {
          id: 'eb457dfa-fa48-470a-8e8c-5fb6954e900d',
          value: 'UNREVIEWED',
          label: 'Unreviewed',
          position: 0,
          color: 'yellow',
        },
        {
          id: '7fd42d8d-684d-419e-930f-1fbd8a09f750',
          value: 'AMBIGUOUS',
          label: 'Ambiguous',
          position: 1,
          color: 'orange',
        },
        {
          id: 'f6c27d16-29e6-4efc-b196-ed3f781d365a',
          value: 'CONFIRMED',
          label: 'Confirmed',
          position: 2,
          color: 'green',
        },
        {
          id: 'f8cafc82-f4dc-43fe-ae2f-76f2bd83a80b',
          value: 'UNRESOLVED',
          label: 'Unresolved',
          position: 3,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_PROCESSING_OUTCOME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'processingOutcome',
      label: 'Processing outcome',
      icon: 'IconRotateClockwise2',
      defaultValue: "'NOT_RUN'",
      options: [
        {
          id: '9e195280-f486-4ec1-854f-fb2c2d7d7525',
          value: 'NOT_RUN',
          label: 'Not run',
          position: 0,
          color: 'gray',
        },
        {
          id: 'e719c15e-700c-45bc-94ec-5fce04d74adc',
          value: 'FAILED',
          label: 'Failed',
          position: 1,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_HAS_CORE_GIFT_ISSUE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'hasCoreGiftIssue',
      label: 'Has core gift issue',
      description: 'Whether core gift data still blocks this row',
      icon: 'IconAlertCircle',
      defaultValue: false,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_IS_READY_FOR_PROCESSING_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isReadyForProcessing',
      label: 'Ready for processing',
      description: 'Explicit reviewer intent that the row is ready',
      icon: 'IconListCheck',
      defaultValue: false,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_PROCESSING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'processingStatus',
      label: 'Processing status',
      icon: 'IconArrowsShuffle',
      defaultValue: "'NOT_READY'",
      options: [
        {
          id: '7250a79f-6d39-4b86-a3d2-136bf1eb8182',
          value: 'NOT_READY',
          label: 'Not ready',
          position: 0,
          color: 'gray',
        },
        {
          id: 'b5d0193c-4383-4a5b-bce7-f8b5c8a6030d',
          value: 'PENDING',
          label: 'Pending',
          position: 1,
          color: 'yellow',
        },
        {
          id: '6da401f8-d3a4-423b-b4b7-2f65ae9bb709',
          value: 'PROCESSED',
          label: 'Processed',
          position: 2,
          color: 'green',
        },
        {
          id: '57f91687-b035-4027-bbaf-2d7f432e5437',
          value: 'PROCESS_FAILED',
          label: 'Process failed',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_ERROR_DETAIL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'errorDetail',
      label: 'Error detail',
      description: 'Last processing error written back to the staging row',
      icon: 'IconAlertTriangle',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_REQUESTED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'giftAidRequested',
      label: 'Gift Aid requested',
      description: 'Whether intake indicated the gift should be considered for Gift Aid',
      icon: 'IconRosetteDiscountCheck',
      defaultValue: false,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_CAPTURED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'giftAidDeclarationCaptured',
      label: 'Gift Aid declaration captured',
      description: 'Whether declaration facts were captured during intake',
      icon: 'IconFileCertificate',
      defaultValue: false,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'giftAidDeclarationDate',
      label: 'Gift Aid declaration date',
      description: 'Captured Gift Aid declaration date',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidCoverageScope',
      label: 'Gift Aid coverage scope',
      description: 'Captured Gift Aid coverage scope',
      icon: 'IconTimeline',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidDeclarationSource',
      label: 'Gift Aid declaration source',
      description: 'How the declaration was captured',
      icon: 'IconWebhook',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        STAGING_REVIEW_ITEM_GIFT_AID_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'giftAidTextVersion',
      label: 'Gift Aid text version',
      description: 'Version of the declaration wording captured at intake',
      icon: 'IconTextCaption',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
