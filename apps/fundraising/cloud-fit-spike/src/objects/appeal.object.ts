import { defineObject, FieldType } from 'twenty-sdk';

export const APPEAL_OBJECT_UNIVERSAL_IDENTIFIER =
  '1d9468d6-82ab-459d-86fa-6a119fcf0cf8';

export const APPEAL_TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  'de1f29bf-e813-4de2-a39b-1c7f07235405';

export default defineObject({
  universalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'appeal',
  namePlural: 'appeals',
  labelSingular: 'Appeal',
  labelPlural: 'Appeals',
  description:
    'Minimal fundraising appeal object for the cloud fit spike processing path.',
  icon: 'IconSpeakerphone',
  labelIdentifierFieldMetadataUniversalIdentifier:
    APPEAL_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: APPEAL_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'title',
      label: 'Title',
      description: 'Display title for the appeal.',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: '4812e9f5-ac4e-4a97-918e-479203af8f99',
      type: FieldType.TEXT,
      name: 'appealType',
      label: 'Appeal Type',
      description: 'Simple classification for the appeal.',
      icon: 'IconCategory',
      isNullable: true,
    },
    {
      universalIdentifier: 'be87419b-6192-4bc1-afc3-1443bc0f0fae',
      type: FieldType.DATE,
      name: 'startDate',
      label: 'Start Date',
      description: 'Start date for the appeal window.',
      icon: 'IconCalendarEvent',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '4e369f63-6429-4f76-88b2-309aeffe40d2',
      type: FieldType.DATE,
      name: 'endDate',
      label: 'End Date',
      description: 'End date for the appeal window.',
      icon: 'IconCalendarX',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
