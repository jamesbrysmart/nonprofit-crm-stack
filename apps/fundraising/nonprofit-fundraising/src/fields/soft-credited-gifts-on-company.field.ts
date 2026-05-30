import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credit-company-on-gift.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const SOFT_CREDITED_GIFTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'e2681f14-9cb6-4f53-8e68-2778f849153e';

export default defineField({
  universalIdentifier: SOFT_CREDITED_GIFTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'softCreditedGifts',
  label: 'Soft credited gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
