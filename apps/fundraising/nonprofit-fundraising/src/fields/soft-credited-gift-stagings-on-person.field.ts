import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDIT_PERSON_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credit-person-on-gift-staging.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const SOFT_CREDITED_GIFT_STAGINGS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '6acfa87d-ab66-4b54-90a7-dfdbe0d30390';

export default defineField({
  universalIdentifier:
    SOFT_CREDITED_GIFT_STAGINGS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'softCreditedGiftStagings',
  label: 'Soft credited gift stagings',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDIT_PERSON_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
