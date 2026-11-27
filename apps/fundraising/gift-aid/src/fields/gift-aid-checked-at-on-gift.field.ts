import { defineField, FieldType } from 'twenty-sdk/define';

import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import { GIFT_AID_CHECKED_AT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GIFT_AID_CHECKED_AT_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'giftAidCheckedAt',
  type: FieldType.DATE_TIME,
  label: 'Gift Aid checked at',
  description: 'When the Gift Aid app last checked this gift',
  icon: 'IconReceiptTax',
  isNullable: true,
  isAuditLogged: false,
});
