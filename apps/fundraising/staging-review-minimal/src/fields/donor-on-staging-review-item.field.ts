import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { STAGING_REVIEW_ITEMS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from './staging-review-items-on-person.field';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  'ef0f932a-52f5-4694-a7cb-61bfe6e1c68d';

export default defineField({
  universalIdentifier:
    DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'donor',
  label: 'Donor',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEMS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'donorId',
  },
});
