import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';

import { FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/fundraising-core';
import {
  GIFT_AID_CLAIM_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFTS_ON_GIFT_AID_CLAIM_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: GIFT_AID_CLAIM_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftAidClaim',
  label: 'Gift Aid claim',
  icon: 'IconReceiptTax',
  relationTargetObjectMetadataUniversalIdentifier: GIFT_AID_CLAIM_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: GIFTS_ON_GIFT_AID_CLAIM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'giftAidClaimId',
  },
});
