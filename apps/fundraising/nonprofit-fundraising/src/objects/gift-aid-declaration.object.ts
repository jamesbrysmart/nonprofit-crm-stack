import { defineObject, FieldType } from 'twenty-sdk/define';

export const GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'c64bdc65-c178-4e4d-a87e-6da6fe24ba2a';

export const GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '9af0fd4f-a5d6-4328-80ad-a6b9649eb6de';

export const GIFT_AID_DECLARATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  'c90dbaaf-55c3-4ca5-a74f-28f54bf54020';

export const GIFT_AID_DECLARATION_STATUS_REASON_FIELD_UNIVERSAL_IDENTIFIER =
  '3b4db224-1ea5-4d35-bbaa-88660ea559a2';

export const GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER =
  'd7401ce5-d690-4b47-867f-e7676406cb7c';

export const GIFT_AID_DECLARATION_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER =
  '8509a695-e58b-4037-bafb-ceb22674b127';

export const GIFT_AID_DECLARATION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  'f8d4323c-c907-4fac-a634-15b6ceab3f43';

export const GIFT_AID_DECLARATION_TEXT_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  'fe3f368f-714e-486f-8d7b-4d4588d60624';

export const GIFT_AID_DECLARATION_REVOKED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'c4794040-643e-4184-bc7d-86ca21f7fd8b';

export const GIFT_AID_DECLARATION_NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  'b626c1f8-2cb8-441f-a236-2bcc0d05efbe';

export default defineObject({
  universalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidDeclaration',
  namePlural: 'giftAidDeclarations',
  labelSingular: 'Gift Aid declaration',
  labelPlural: 'Gift Aid declarations',
  description: 'Donor-level Gift Aid declaration history for fundraising.',
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
          id: '128692ba-b7fb-4253-87ad-3ca2b1f60754',
          value: 'ACTIVE',
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: 'df3d4f2c-243c-4f02-b25d-eddf7dce7738',
          value: 'INSUFFICIENT',
          label: 'Insufficient',
          position: 1,
          color: 'yellow',
        },
        {
          id: '5db53917-ffdf-4298-a531-017e778ecae0',
          value: 'REVOKED',
          label: 'Revoked',
          position: 2,
          color: 'red',
        },
        {
          id: '9861ddb9-0540-4103-adfc-09d4c122f430',
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
      description: 'Date the declaration was made or captured',
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
