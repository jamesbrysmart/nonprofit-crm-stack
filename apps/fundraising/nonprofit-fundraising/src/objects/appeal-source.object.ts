import { defineObject, FieldType } from 'twenty-sdk/define';

export const APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER =
  '627b8ca6-6068-46c8-b9ab-df907c34a8d4';

export const APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'fa79e249-e995-4850-91c9-6a775345b0e2';

export const APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '5f4400b9-1c60-45fe-a3d2-e7332d638765';

export const APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '7401f941-3a03-4050-8c31-8d3cb0807455';

export const APPEAL_SOURCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '22d48c67-8780-4ffb-bf78-0a25f54af00f';

export const APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  'cb7ca435-5ad2-45a0-93d1-feeeb7044739';

export const APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '3940b15f-a96b-4bcc-a08c-b839a255b4c1';

export const APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER =
  'e0d0d4b7-9fe6-4768-90dc-fa1ff150b72e';

export const APPEAL_SOURCE_URL_FIELD_UNIVERSAL_IDENTIFIER =
  '2ade057f-ae10-4b1e-a7af-db9c77fc0f0d';

export const APPEAL_SOURCE_START_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '6b1ffd5c-2ce5-4d20-a588-bc91d86d6fa7';

export const APPEAL_SOURCE_END_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '945597dc-f1c7-4dff-a12a-2609daf0912b';

export const APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '40956cbb-1ee1-4f2a-9e4c-12eb5fd97087';

export const APPEAL_SOURCE_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'dbd13721-7411-46a7-be6a-814a40fe585a';

export const APPEAL_SOURCE_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '11a7c526-43ce-4f91-8156-529bc10ec1f4';

export const APPEAL_SOURCE_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '4026225e-4c4a-48ea-848f-aa0fdc5b76d5';

export const APPEAL_SOURCE_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '30d2244b-18b9-41f9-b24e-cc4dfe153001';

export default defineObject({
  universalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'appealSource',
  namePlural: 'appealSources',
  labelSingular: 'Appeal source',
  labelPlural: 'Appeal sources',
  description:
    'Child attribution and reporting unit under an appeal for tracking channels, pages, segments, codes, or fundraising executions.',
  icon: 'IconRoute2',
  labelIdentifierFieldMetadataUniversalIdentifier:
    APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: APPEAL_SOURCE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Primary display name for the appeal source.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: APPEAL_SOURCE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'sourceType',
      label: 'Source type',
      description:
        'Controlled classification for the channel, route, or execution represented by this appeal source.',
      icon: 'IconCategory2',
      defaultValue: "'OTHER'",
      options: [
        {
          id: 'af6c528c-f383-40cf-b612-32f9e0e1d3e7',
          value: 'EMAIL',
          label: 'Email',
          position: 0,
          color: 'blue',
        },
        {
          id: 'c62302c9-6f56-474d-8582-c2db5fca0f0b',
          value: 'DIRECT_MAIL',
          label: 'Direct mail',
          position: 1,
          color: 'orange',
        },
        {
          id: '09060cac-7578-40ce-8fd9-73816b69e33c',
          value: 'DONATION_PAGE',
          label: 'Donation page',
          position: 2,
          color: 'green',
        },
        {
          id: '7461ea7b-f04d-4280-a094-c8af1c2607c0',
          value: 'P2P_PAGE',
          label: 'P2P page',
          position: 3,
          color: 'blue',
        },
        {
          id: 'ae5d064b-f521-4493-b2a4-b827d14318cf',
          value: 'QR_CODE',
          label: 'QR code',
          position: 4,
          color: 'yellow',
        },
        {
          id: '5934db5d-e2af-4d01-8b95-a7d9a8ff9c77',
          value: 'SOCIAL',
          label: 'Social',
          position: 5,
          color: 'blue',
        },
        {
          id: '0bced5c8-2585-4ea2-b7b8-0743d7c3e3b1',
          value: 'AD',
          label: 'Ad',
          position: 6,
          color: 'red',
        },
        {
          id: '804a2e92-0c48-4d95-a6d6-1edbbdbf9c39',
          value: 'PARTNER',
          label: 'Partner',
          position: 7,
          color: 'purple',
        },
        {
          id: '1cfb349e-4295-4753-91a6-4254b83d7fb7',
          value: 'PHONE',
          label: 'Phone',
          position: 8,
          color: 'gray',
        },
        {
          id: '802b5530-8682-4bb6-a1a7-e7cdb956bfbc',
          value: 'EVENT_ASK',
          label: 'Event ask',
          position: 9,
          color: 'yellow',
        },
        {
          id: '76a3018e-bca4-4fca-8a57-a5e6f361ec55',
          value: 'SEGMENT',
          label: 'Segment',
          position: 10,
          color: 'gray',
        },
        {
          id: '6bb7d0f3-9726-40f9-aa18-a68dc6285ecb',
          value: 'OTHER',
          label: 'Other',
          position: 11,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: APPEAL_SOURCE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Operational status of the appeal source.',
      icon: 'IconListCheck',
      defaultValue: "'DRAFT'",
      options: [
        {
          id: 'ef8b74fa-8cff-4512-bef1-e10ecf6f1dc3',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '30f6c478-f954-4844-85b2-c8238f16344f',
          value: 'ACTIVE',
          label: 'Active',
          position: 1,
          color: 'green',
        },
        {
          id: '2ddd7c62-c1f7-4b87-83f8-93f9796ce528',
          value: 'CLOSED',
          label: 'Closed',
          position: 2,
          color: 'yellow',
        },
        {
          id: '9859868d-d428-487d-b1e4-b5dd86df2ab6',
          value: 'ARCHIVED',
          label: 'Archived',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: APPEAL_SOURCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description:
        'Description of the source, route, segment, or execution being tracked.',
      icon: 'IconAlignLeft',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_SOURCE_SOURCE_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sourceCode',
      label: 'Source code',
      description:
        'Internal or printed source code used to identify this appeal source.',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_EXTERNAL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'External ID',
      description:
        'Stable external page, route, or source identifier in a platform or partner system.',
      icon: 'IconExternalLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_SOURCE_PLATFORM_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'platform',
      label: 'Platform',
      description:
        'External platform or system associated with this appeal source when relevant.',
      icon: 'IconPlugConnected',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_SOURCE_URL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.LINKS,
      name: 'url',
      label: 'URL',
      description: 'Primary public or tracking URL for this appeal source.',
      icon: 'IconLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_SOURCE_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'startDate',
      label: 'Start date',
      description: 'When this appeal source is intended to start.',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_SOURCE_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'endDate',
      label: 'End date',
      description: 'When this appeal source is intended to end.',
      icon: 'IconCalendarOff',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_AUDIENCE_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'audienceDescription',
      label: 'Audience description',
      description:
        'Optional description of the audience, segment, or route associated with this appeal source.',
      icon: 'IconUsersGroup',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'raisedAmount',
      label: 'Raised amount',
      description:
        'Materialized total value of committed cash gifts coded to this appeal source.',
      icon: 'IconCurrencyPound',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'giftCount',
      label: 'Gift count',
      description:
        'Materialized number of committed cash gifts coded to this appeal source.',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'donorCount',
      label: 'Donor count',
      description:
        'Materialized count of distinct contributors linked to gifts on this appeal source.',
      icon: 'IconUsers',
      defaultValue: 0,
    },
    {
      universalIdentifier:
        APPEAL_SOURCE_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'lastGiftAt',
      label: 'Last gift date',
      description: 'Most recent committed gift date coded to this appeal source.',
      icon: 'IconCalendarStats',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
