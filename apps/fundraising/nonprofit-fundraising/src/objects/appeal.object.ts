import { defineObject, FieldType } from 'twenty-sdk/define';

export const APPEAL_OBJECT_UNIVERSAL_IDENTIFIER =
  '4e32d67c-ea90-4914-b88a-3049697d03eb';

export const APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'c329af1e-f4ff-4d00-b0ae-32d50b7f92cc';

export const APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  '2e60376e-1730-4d37-8ba3-987a0169ca1d';

export const APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '555a1175-a357-4d4b-aa0a-a8154a4b44ef';

export const APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '5f2b35f7-920c-47c3-81ea-e453203f4b3f';

export const APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  'd9fd26fe-c78d-4cc1-b06a-f684a2dbf701';

export const APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '5060a537-91ff-4c35-a83e-b6bdf992b4f0';

export const APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'c58009e4-69b9-41d0-bf7d-b67029ee0f0d';

export const APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'abdc55c2-bb18-4ca1-a2b6-46f5be1bd19b';

export const APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER =
  '0d860a8e-f0d7-4ba3-bd4c-6336cf51c80e';

export const APPEAL_NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  '559d756f-e30a-43b6-a31d-b7c3e49f52f4';

export const APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '639aa87f-45f2-463c-bddb-e223a7261a53';

export const APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '4be0b759-d127-40df-9c48-dc8535b8ad3c';

export const APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '3d2cf701-bfe0-490b-bb91-497b72343fa5';

export const APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '8c1b8fb8-3807-4f7a-a24e-35c4dd0f5b40';

export default defineObject({
  universalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'appeal',
  namePlural: 'appeals',
  labelSingular: 'Appeal',
  labelPlural: 'Appeals',
  description:
    'Fundraising effort and attribution bucket used for coding gifts and reviewing fundraising performance.',
  icon: 'IconTargetArrow',
  labelIdentifierFieldMetadataUniversalIdentifier:
    APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Primary display name for the fundraising appeal.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: APPEAL_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Description of the appeal and its purpose.',
      icon: 'IconAlignLeft',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Operational status of the appeal.',
      icon: 'IconListCheck',
      defaultValue: "'DRAFT'",
      options: [
        {
          id: '6e213f80-bb3c-45ab-9ca7-8b7177206e1a',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: '4a53342f-8e81-4fdb-b542-2c8d19df2e2f',
          value: 'ACTIVE',
          label: 'Active',
          position: 1,
          color: 'green',
        },
        {
          id: 'f23ad1e0-2d07-4f58-bce6-d59b40c3f323',
          value: 'CLOSED',
          label: 'Closed',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'c2f7d95a-f143-4519-a339-d93eb534b4f7',
          value: 'ARCHIVED',
          label: 'Archived',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'appealType',
      label: 'Appeal type',
      description: 'Small controlled classification for the appeal.',
      icon: 'IconCategory2',
      defaultValue: "'GENERAL'",
      options: [
        {
          id: '017bc14d-c6af-4fb8-a903-e9fb308083f4',
          value: 'GENERAL',
          label: 'General',
          position: 0,
          color: 'gray',
        },
        {
          id: '4c68b917-a7f7-49da-9dd2-38111e1931d7',
          value: 'ANNUAL',
          label: 'Annual',
          position: 1,
          color: 'blue',
        },
        {
          id: '08ef1970-7c4a-4431-9c10-573ba514f70c',
          value: 'EMERGENCY',
          label: 'Emergency',
          position: 2,
          color: 'red',
        },
        {
          id: '32d7d0be-0f38-4f36-b4f4-4adab86f5c82',
          value: 'REGULAR_GIVING',
          label: 'Regular giving',
          position: 3,
          color: 'green',
        },
        {
          id: '59f7d9c5-a612-4a2b-aa66-81ad91997911',
          value: 'EVENT_FUNDRAISING',
          label: 'Event fundraising',
          position: 4,
          color: 'yellow',
        },
        {
          id: '328a55e2-d060-4f45-9d2e-6d8c13a44b32',
          value: 'CAPITAL',
          label: 'Capital',
          position: 5,
          color: 'orange',
        },
        {
          id: '93d889ea-c27a-4c95-a2f7-936aa95c86a4',
          value: 'CROWDFUNDING',
          label: 'Crowdfunding',
          position: 6,
          color: 'blue',
        },
        {
          id: 'b08f55fb-9e0a-4d85-b474-63b44a6f0d28',
          value: 'OTHER',
          label: 'Other',
          position: 7,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: APPEAL_START_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'startDate',
      label: 'Start date',
      description: 'When the appeal is intended to start.',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_END_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'endDate',
      label: 'End date',
      description: 'When the appeal is intended to end.',
      icon: 'IconCalendarOff',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'goalAmount',
      label: 'Goal amount',
      description: 'Financial target for the appeal.',
      icon: 'IconTargetArrow',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_BUDGET_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'budgetAmount',
      label: 'Budget amount',
      description: 'Planned spend or budget allocation for the appeal.',
      icon: 'IconWallet',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_EXTERNAL_REFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalReference',
      label: 'External reference',
      description: 'External campaign, page, or platform identifier for this appeal.',
      icon: 'IconExternalLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      description: 'Operational notes about the appeal.',
      icon: 'IconNotes',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'raisedAmount',
      label: 'Raised amount',
      description: 'Materialized total value of committed gifts coded to this appeal.',
      icon: 'IconCurrencyPound',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'giftCount',
      label: 'Gift count',
      description: 'Materialized number of committed gifts coded to this appeal.',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier: APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'donorCount',
      label: 'Donor count',
      description: 'Materialized count of distinct contributors linked to gifts on this appeal.',
      icon: 'IconUsers',
      defaultValue: 0,
    },
    {
      universalIdentifier: APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'lastGiftAt',
      label: 'Last gift date',
      description: 'Most recent committed gift date coded to this appeal.',
      icon: 'IconCalendarStats',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
