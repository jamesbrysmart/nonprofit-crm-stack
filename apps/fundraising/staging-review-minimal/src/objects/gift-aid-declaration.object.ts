import { defineObject, FieldType } from 'twenty-sdk';

export const GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'f88eb418-f845-4a25-aa22-204fa78864e5';

export const GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '4d53db8f-81e4-479c-9b03-7e1b4ded78d6';

export const GIFT_AID_DECLARATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'e435504c-d3ae-4321-81b0-0da605f97bef';

export const GIFT_AID_DECLARATION_STATUS_REASON_FIELD_UNIVERSAL_IDENTIFIER =
  '83d974bd-a4f6-460f-b09b-b3f78f40d9f4';

export const GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  '27fd3ec1-c03e-4cfe-aabd-4466434d710d';

export const GIFT_AID_DECLARATION_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER =
  'be982703-0963-4a4f-bb68-65944eea0d02';

export const GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '31ac0db8-21e3-4f47-9bd9-ee14389d6e9e';

export const GIFT_AID_DECLARATION_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  'e6f64a65-6883-4285-a01e-a0e44d18e866';

export const GIFT_AID_DECLARATION_REVOKED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'd4d1350c-cb57-4f54-aab5-9d4453bd77ea';

export const GIFT_AID_DECLARATION_NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  'fb3a6f1d-854a-4cf6-86dc-7a4858753dd9';

export default defineObject({
  universalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidDeclaration',
  namePlural: 'giftAidDeclarations',
  labelSingular: 'Gift Aid declaration',
  labelPlural: 'Gift Aid declarations',
  description: 'Donor-level Gift Aid declaration history for the fundraising app.',
  icon: 'IconFileCertificate',
  labelIdentifierFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Human-readable label for the declaration record',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: GIFT_AID_DECLARATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconRosetteDiscountCheck',
      defaultValue: "'ACTIVE'",
      options: [
        {
          id: 'f45d1c62-af27-4c04-afdd-c5bd1cedd476',
          value: 'ACTIVE',
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: '7229d4b9-cb07-4737-97ca-f9d807e88041',
          value: 'INSUFFICIENT',
          label: 'Insufficient',
          position: 1,
          color: 'yellow',
        },
        {
          id: '471ea1db-dcc1-4455-bb83-bf32ad9850fb',
          value: 'REVOKED',
          label: 'Revoked',
          position: 2,
          color: 'red',
        },
        {
          id: '3430ba18-c02e-4797-8e1b-f655fb9824c6',
          value: 'SUPERSEDED',
          label: 'Superseded',
          position: 3,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        GIFT_AID_DECLARATION_STATUS_REASON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'statusReason',
      label: 'Status reason',
      description: 'Reason explaining the current declaration status',
      icon: 'IconAlertTriangle',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE,
      name: 'declarationDate',
      label: 'Declaration date',
      description: 'Date the declaration was captured or made',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_DECLARATION_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'coverageScope',
      label: 'Coverage scope',
      description: 'Scope describing whether the declaration covers past or future gifts',
      icon: 'IconTimeline',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'source',
      label: 'Source',
      description: 'How the declaration was captured',
      icon: 'IconWebhook',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_DECLARATION_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'textVersion',
      label: 'Text version',
      description: 'Declaration wording or version captured at intake',
      icon: 'IconTextCaption',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        GIFT_AID_DECLARATION_REVOKED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'revokedAt',
      label: 'Revoked at',
      description: 'When the declaration was revoked if no longer usable',
      icon: 'IconClockCancel',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: GIFT_AID_DECLARATION_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      description: 'Short notes about the declaration record',
      icon: 'IconNotes',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
