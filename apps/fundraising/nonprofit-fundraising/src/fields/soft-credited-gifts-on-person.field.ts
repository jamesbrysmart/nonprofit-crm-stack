import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credit-person-on-gift.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const SOFT_CREDITED_GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '0af4e398-7086-48df-88c4-8a8d41f8863f';

export default defineField({
  universalIdentifier: SOFT_CREDITED_GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'softCreditedGifts',
  label: 'Soft credited gifts',
  icon: 'IconGift',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
