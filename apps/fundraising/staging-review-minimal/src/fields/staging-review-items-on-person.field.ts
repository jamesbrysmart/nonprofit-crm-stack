import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';
import { DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER } from './donor-on-staging-review-item.field';
import { STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER } from 'src/objects/staging-review-item.object';

export const STAGING_REVIEW_ITEMS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'fe31ef02-c1aa-4b7e-bb56-aad19aa6555e';

export default defineField({
  universalIdentifier:
    STAGING_REVIEW_ITEMS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'stagingReviewItems',
  label: 'Staging review items',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    STAGING_REVIEW_ITEM_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DONOR_ON_STAGING_REVIEW_ITEM_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
