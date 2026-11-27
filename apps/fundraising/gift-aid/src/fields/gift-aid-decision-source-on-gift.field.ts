import { defineField, FieldType } from 'twenty-sdk/define';
import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { GIFT_GIFT_AID_DECISION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  isUIEditable: false,
  universalIdentifier:
    GIFT_GIFT_AID_DECISION_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.SELECT,
  name: 'giftAidDecisionSource',
  label: 'Gift Aid decision source',
  description:
    'Whether the current Gift Aid outcome was derived automatically or set manually',
  icon: 'IconBolt',
  defaultValue: "'SYSTEM'",
  options: [
    {
      id: '0cce6c02-c1bf-4c34-af5f-cc6295e06a53',
      value: 'SYSTEM',
      label: 'System',
      position: 0,
      color: 'blue',
    },
    {
      id: '49a48e35-e4ae-41fd-8c80-6e33721ba0ea',
      value: 'MANUAL_OVERRIDE',
      label: 'Manual override',
      position: 1,
      color: 'orange',
    },
  ],
});
