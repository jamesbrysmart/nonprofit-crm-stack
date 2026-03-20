import { defineObject, FieldType } from 'twenty-sdk';

export const FUND_OBJECT_UNIVERSAL_IDENTIFIER =
  'd74c57dd-d868-4209-aba8-f6db851d1164';

export const FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER =
  'cd43bb2e-7318-4afc-98e2-3bdbdeb505ba';

export default defineObject({
  universalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'fund',
  namePlural: 'funds',
  labelSingular: 'Fund',
  labelPlural: 'Funds',
  description:
    'Minimal fundraising fund object for the cloud fit spike processing path.',
  icon: 'IconCoinPound',
  labelIdentifierFieldMetadataUniversalIdentifier:
    FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'code',
      label: 'Code',
      description: 'Stable code or short name for the fund.',
      icon: 'IconHash',
    },
    {
      universalIdentifier: '64e4ebad-07b8-4421-be4a-64c9b4529296',
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Short description for the fund.',
      icon: 'IconFileDescription',
      isNullable: true,
    },
    {
      universalIdentifier: '9b00be83-0d5f-4023-be80-495a1de0e86f',
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Is Active',
      description: 'Whether the fund is currently available for gift attribution.',
      icon: 'IconCheck',
      defaultValue: true,
    },
  ],
});
