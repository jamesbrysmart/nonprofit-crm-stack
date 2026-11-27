import { defineField, FieldType } from 'twenty-sdk/define';
import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  isUIEditable: false,
  universalIdentifier: GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldType.TEXT,
  name: 'giftAidReasonCode',
  label: 'Gift Aid reason code',
  description: 'Machine-readable reason for the current Gift Aid outcome',
  icon: 'IconAlertCircle',
  isNullable: true,
  defaultValue: null,
});
