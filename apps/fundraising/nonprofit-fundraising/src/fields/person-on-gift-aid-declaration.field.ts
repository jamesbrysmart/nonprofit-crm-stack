import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-aid-declarations-on-person.field';
import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-aid-declaration.object';

export const PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER =
  'c2cba144-a326-4ee7-ac46-4e8394fc2d76';

export default defineField({
  universalIdentifier:
    PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'person',
  label: 'Person',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'personId',
  },
});
