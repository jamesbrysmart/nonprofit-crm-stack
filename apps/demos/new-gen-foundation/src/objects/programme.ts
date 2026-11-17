import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '91a7d232-affd-4bb3-b57a-7991e30e855b';

export default defineObject({
  universalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  nameSingular: 'programme',
  namePlural: 'programmes',
  labelSingular: 'Programme',
  labelPlural: 'Programmes',
  description: "An NGF artistic programme",
  icon: 'IconMasksTheater',
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
      universalIdentifier: 'f9103f44-b42e-4062-9d1a-c61dfa7b47d2',
      type: FieldType.SELECT,
      name: 'discipline',
      label: "Discipline",
      icon: 'IconMusic',
      options: [
        { value: 'OPERA', label: "Opera", position: 0, color: 'purple' },
        { value: 'SACRED_MUSIC', label: "Sacred music", position: 1, color: 'blue' },
        { value: 'BALLET', label: "Ballet", position: 2, color: 'pink' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: '4e1db78f-9865-454a-b2ac-6effc5eb1ee7',
      type: FieldType.TEXT,
      name: 'tagline',
      label: "Tagline",
      icon: 'IconQuote',
      isNullable: true,
    },
    {
      universalIdentifier: '542b5d04-4b21-4a02-98de-cc4d89f74b5f',
      type: FieldType.TEXT,
      name: 'description',
      label: "Description",
      icon: 'IconAlignLeft',
      isNullable: true,
    },
    {
      universalIdentifier: 'b92443ca-73e1-4aec-b511-6c566825b4a8',
      type: FieldType.SELECT,
      name: 'status',
      label: "Status",
      icon: 'IconProgress',
      options: [
        { value: 'ACTIVE', label: "Active", position: 0, color: 'green' },
        { value: 'LAUNCHING', label: "Launching", position: 1, color: 'sky' },
        { value: 'PAUSED', label: "Paused", position: 2, color: 'gray' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: '5af89a42-f6a6-4700-b8b1-b2dd85fe7b32',
      type: FieldType.NUMBER,
      name: 'launchYear',
      label: "Launch year",
      icon: 'IconCalendar',
      isNullable: true,
    },
    {
      universalIdentifier: '0fbeaa23-ffd2-4ebf-8251-6b1329baf831',
      type: FieldType.CURRENCY,
      name: 'annualBudget',
      label: "Annual budget",
      icon: 'IconCoins',
      isNullable: true,
    },
  ],
});
