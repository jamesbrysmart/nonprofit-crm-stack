import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDITED_GIFT_STAGINGS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credited-gift-stagings-on-person.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export const SOFT_CREDIT_PERSON_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '3e7cecef-55cf-4e5d-9b4c-cf5856e4d24a';

export default defineField({
  universalIdentifier:
    SOFT_CREDIT_PERSON_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'softCreditPerson',
  label: 'Soft credit person',
  icon: 'IconUserHeart',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDITED_GIFT_STAGINGS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'softCreditPersonId',
  },
});
