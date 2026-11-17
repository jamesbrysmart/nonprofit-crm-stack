import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'c4ef5fe6-6fae-49af-9d1a-2007b826d867';

export default defineObject({
  universalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  nameSingular: 'membership',
  namePlural: 'memberships',
  labelSingular: 'Membership',
  labelPlural: 'Memberships',
  description: "A Friends or Under-35 membership",
  icon: 'IconId',
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
      universalIdentifier: '89c94592-eeda-4723-b230-48bfea482aab',
      type: FieldType.SELECT,
      name: 'tier',
      label: "Tier",
      icon: 'IconStar',
      options: [
        { value: 'FRIEND', label: "Friend", position: 0, color: 'purple' },
        { value: 'UNDER_35', label: "Under-35", position: 1, color: 'sky' },
        { value: 'HONORARY', label: "Honorary", position: 2, color: 'yellow' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: '01b4e1f7-17b4-4b87-a55f-42b7edc5a302',
      type: FieldType.SELECT,
      name: 'status',
      label: "Status",
      icon: 'IconProgress',
      options: [
        { value: 'ACTIVE', label: "Active", position: 0, color: 'green' },
        { value: 'RENEWAL_DUE', label: "Renewal due", position: 1, color: 'orange' },
        { value: 'LAPSED', label: "Lapsed", position: 2, color: 'red' },
        { value: 'CANCELLED', label: "Cancelled", position: 3, color: 'gray' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: 'c11895a4-7309-45bc-bf8d-2e390cf13a16',
      type: FieldType.DATE,
      name: 'memberSince',
      label: "Member since",
      icon: 'IconCalendarHeart',
      isNullable: true,
    },
    {
      universalIdentifier: 'fcf258c4-cc0f-436f-97cf-5db33ce650a5',
      type: FieldType.DATE,
      name: 'startDate',
      label: "Current period start",
      icon: 'IconCalendarPlus',
      isNullable: true,
    },
    {
      universalIdentifier: '2bc77f4b-cdce-4276-93c2-8ca4cd3e4962',
      type: FieldType.DATE,
      name: 'endDate',
      label: "Renewal date",
      icon: 'IconCalendarDue',
      isNullable: true,
    },
    {
      universalIdentifier: 'dcc0596c-40aa-48f8-93a7-095df1261794',
      type: FieldType.CURRENCY,
      name: 'annualFee',
      label: "Annual fee",
      icon: 'IconCoins',
      isNullable: true,
    },
  ],
});
