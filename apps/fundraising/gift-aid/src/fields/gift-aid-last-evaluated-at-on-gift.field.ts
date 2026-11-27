import { defineField, FieldType } from 'twenty-sdk/define';
import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { GIFT_GIFT_AID_LAST_EVALUATED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  isUIEditable: false,
  universalIdentifier:
    GIFT_GIFT_AID_LAST_EVALUATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.DATE_TIME,
  name: 'giftAidLastEvaluatedAt',
  label: 'Gift Aid last evaluated at',
  description: 'When the current Gift Aid outcome was last derived',
  icon: 'IconClock',
  isNullable: true,
  defaultValue: null,
});
