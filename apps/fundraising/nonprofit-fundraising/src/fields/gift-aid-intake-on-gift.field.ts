import { defineField, FieldType } from 'twenty-sdk/define';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: 'ce63c097-5fa4-4353-9b78-4b2dea11a124',
  name: 'giftAidIntake',
  label: 'Gift Aid intake',
  type: FieldType.RAW_JSON,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  isNullable: true,
  defaultValue: null,
  isUIEditable: false,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  description: 'Gift Aid evidence captured when this gift was recorded.',
});
