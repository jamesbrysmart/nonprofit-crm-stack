import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  GIFT_AID_CLAIM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: GIFT_AID_CLAIM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'giftAidClaim',
  namePlural: 'giftAidClaims',
  labelSingular: 'Gift Aid claim',
  labelPlural: 'Gift Aid claims',
  description: 'A Gift Aid claim and the gifts included in it.',
  icon: 'IconReceiptTax',
  labelIdentifierFieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: GIFT_AID_CLAIM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
  ],
});
