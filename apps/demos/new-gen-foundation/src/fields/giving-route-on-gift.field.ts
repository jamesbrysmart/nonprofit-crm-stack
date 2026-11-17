import { defineField, FieldType } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising';

export default defineField({
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  universalIdentifier: 'af45e7fc-3dba-4899-bbde-3d801050b081',
  type: FieldType.SELECT,
  name: 'givingRoute',
  label: "Giving route",
  icon: 'IconWorld',
  options: [
    { value: 'ITALY_DIRECT', label: "Italy (direct)", position: 0, color: 'green' },
    { value: 'UK_ROUTE', label: "UK giving route", position: 1, color: 'blue' },
    { value: 'US_CAF_AMERICA', label: "US (CAF America)", position: 2, color: 'red' },
    { value: 'OTHER', label: "Other", position: 3, color: 'gray' },
  ],
  isNullable: true,
});
