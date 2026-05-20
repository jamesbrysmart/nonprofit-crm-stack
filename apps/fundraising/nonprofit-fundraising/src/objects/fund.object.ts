import { defineObject, FieldType } from 'twenty-sdk/define';

export const FUND_OBJECT_UNIVERSAL_IDENTIFIER =
  '7c0ba5a3-68ce-4cbe-a08f-1d4088a44d2e';

export const FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f7c86e1c-a762-4cb0-aa3c-7db650e6141b';

export const FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  '8f34d3fb-5af4-46ef-83fe-38fd7ce7c1a6';

export const FUND_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  'f84a48f4-f7f0-4cf6-9d72-c589a3085657';

export const FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '55f8e0f4-0bab-422e-b9ca-e3fb3970724d';

export const FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER =
  'a4cf9850-564b-4b8b-aa2d-0068af707c8c';

export const FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  '16d00d35-3ba7-4609-98ca-0189b953e9f0';

export const FUND_NOTES_FIELD_UNIVERSAL_IDENTIFIER =
  'cc4331b1-4801-4fb4-b77d-68a02199ac1d';

export default defineObject({
  universalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'fund',
  namePlural: 'funds',
  labelSingular: 'Fund',
  labelPlural: 'Funds',
  description:
    'Destination, designation, or restriction bucket for fundraising income.',
  icon: 'IconPigMoney',
  labelIdentifierFieldMetadataUniversalIdentifier:
    FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Primary display name for the fund.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'code',
      label: 'Code',
      description: 'Short internal or finance-facing code for the fund.',
      icon: 'IconHash',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: FUND_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Human-readable description of the fund purpose.',
      icon: 'IconAlignLeft',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'restrictionType',
      label: 'Restriction type',
      description: 'Whether this fund is unrestricted, restricted, designated, or endowment-like.',
      icon: 'IconRosetteDiscountCheck',
      defaultValue: "'UNRESTRICTED'",
      options: [
        {
          id: '714cdcbf-cfdc-4e16-ba8e-ab80a12ef956',
          value: 'UNRESTRICTED',
          label: 'Unrestricted',
          position: 0,
          color: 'green',
        },
        {
          id: '9e6f15c4-188d-4d88-b393-69dabd073f67',
          value: 'RESTRICTED',
          label: 'Restricted',
          position: 1,
          color: 'red',
        },
        {
          id: '749d0ed5-bb2f-457f-b2a5-f4c7d4eb43dd',
          value: 'DESIGNATED',
          label: 'Designated',
          position: 2,
          color: 'blue',
        },
        {
          id: 'b90f7583-f40d-4db4-a2b0-8eb97f41887c',
          value: 'ENDOWMENT',
          label: 'Endowment',
          position: 3,
          color: 'yellow',
        },
        {
          id: 'b0bb9da8-1fa9-49e2-b67d-f5f613979aeb',
          value: 'OTHER',
          label: 'Other',
          position: 4,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Active',
      description: 'Whether this fund should appear in ordinary operational pickers.',
      icon: 'IconCircleCheck',
      defaultValue: true,
    },
    {
      universalIdentifier:
        FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'externalAccountingCode',
      label: 'External accounting code',
      description: 'External finance or accounting-system mapping code for the fund.',
      icon: 'IconBuildingBank',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: FUND_NOTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'notes',
      label: 'Notes',
      description: 'Operational notes about using this fund.',
      icon: 'IconNotes',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
