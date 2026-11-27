import { defineField, FieldType } from 'twenty-sdk/define';
import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  isUIEditable: false,
  universalIdentifier: GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.SELECT,
  name: 'giftAidStatus',
  label: 'Gift Aid status',
  description: 'Current Gift Aid outcome on the final gift',
  icon: 'IconRosetteDiscountCheck',
  isNullable: true,
  defaultValue: null,
  options: [
    {
      id: 'aec464bf-de05-46fb-bc36-ab737296d468',
      value: 'CLAIMABLE',
      label: 'Claimable',
      position: 0,
      color: 'green',
    },
    {
      id: 'e4e69f63-e5fd-40cf-bd1f-50718a0ec423',
      value: 'NOT_CLAIMABLE',
      label: 'Not claimable',
      position: 1,
      color: 'gray',
    },
    {
      id: '9a8237b3-0029-4e09-81ad-28e952d36b42',
      value: 'NEEDS_REVIEW',
      label: 'Needs review',
      position: 2,
      color: 'yellow',
    },
  ],
});
