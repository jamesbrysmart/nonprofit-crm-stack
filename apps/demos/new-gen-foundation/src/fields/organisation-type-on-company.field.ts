import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  universalIdentifier: '8c32ef5d-7588-4412-89bb-c3f19fe0904f',
  type: FieldType.SELECT,
  name: 'organisationType',
  label: "Organisation type",
  icon: 'IconBuildingBank',
  options: [
    { value: 'BANKING_FOUNDATION', label: "Banking foundation", position: 0, color: 'blue' },
    { value: 'FAMILY_FOUNDATION', label: "Family foundation", position: 1, color: 'purple' },
    { value: 'TRUST', label: "Trust", position: 2, color: 'sky' },
    { value: 'CORPORATE', label: "Corporate", position: 3, color: 'orange' },
    { value: 'VENUE', label: "Venue", position: 4, color: 'pink' },
    { value: 'CULTURAL_INSTITUTION', label: "Cultural institution", position: 5, color: 'turquoise' },
    { value: 'GIVING_INTERMEDIARY', label: "Giving intermediary", position: 6, color: 'yellow' },
    { value: 'PUBLIC_BODY', label: "Public body", position: 7, color: 'gray' },
    { value: 'MEDIA', label: "Media", position: 8, color: 'red' },
  ],
  isNullable: true,
});
