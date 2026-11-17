import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'f792cd11-3f4b-4d84-a2bc-80b3e63a87bf';

export default defineObject({
  universalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  nameSingular: 'relationship',
  namePlural: 'relationships',
  labelSingular: 'Relationship',
  labelPlural: 'Relationships',
  description: "A typed relationship between a person and another person or organisation",
  icon: 'IconAffiliate',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: '0dcb707c-563e-4b5b-9a6c-faded40e4ed0',
      type: FieldType.SELECT,
      name: 'relationshipType',
      label: "Type",
      icon: 'IconAffiliate',
      options: [
        { value: 'SPOUSE_PARTNER', label: "Spouse / partner", position: 0, color: 'pink' },
        { value: 'FAMILY', label: "Family", position: 1, color: 'pink' },
        { value: 'PATRON_OF', label: "Patron of", position: 2, color: 'purple' },
        { value: 'MENTOR_OF', label: "Mentor of", position: 3, color: 'green' },
        { value: 'INTRODUCED_BY', label: "Introduced by", position: 4, color: 'yellow' },
        { value: 'COLLEAGUE', label: "Colleague", position: 5, color: 'sky' },
        { value: 'TRUSTEE_OF', label: "Trustee / board of", position: 6, color: 'red' },
        { value: 'WORKS_AT', label: "Works at", position: 7, color: 'blue' },
        { value: 'CONTACT_FOR', label: "Main contact for", position: 8, color: 'turquoise' },
        { value: 'ADVISER_TO', label: "Adviser to", position: 9, color: 'orange' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: 'a3c0b4d6-d645-4414-afb0-58045ab5e2d3',
      type: FieldType.DATE,
      name: 'startDate',
      label: "Start date",
      icon: 'IconCalendarPlus',
      isNullable: true,
    },
    {
      universalIdentifier: '1c4c0605-bf42-4528-a93d-5c5dbead85b8',
      type: FieldType.DATE,
      name: 'endDate',
      label: "End date",
      icon: 'IconCalendarMinus',
      isNullable: true,
    },
    {
      universalIdentifier: '221bdf54-c4a3-493f-b168-522c19a10be7',
      type: FieldType.TEXT,
      name: 'notes',
      label: "Notes",
      icon: 'IconNotes',
      isNullable: true,
    },
  ],
});
