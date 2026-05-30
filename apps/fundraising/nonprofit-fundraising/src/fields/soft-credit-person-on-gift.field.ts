import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDITED_GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credited-gifts-on-person.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  '250fa446-1830-4bf9-81ef-12db4f5deae8';

export default defineField({
  universalIdentifier: SOFT_CREDIT_PERSON_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'softCreditPerson',
  label: 'Soft credit person',
  icon: 'IconUserHeart',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDITED_GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'softCreditPersonId',
  },
});
