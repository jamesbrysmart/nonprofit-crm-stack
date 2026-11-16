import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  SOFT_CREDITED_GIFT_STAGINGS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  SOFT_CREDIT_PERSON_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
