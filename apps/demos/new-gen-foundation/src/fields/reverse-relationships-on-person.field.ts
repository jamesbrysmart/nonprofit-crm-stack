import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { RELATED_PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/related-person-on-relationship.field';

export const REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'b9e872ce-67b1-4cf0-9358-cd2cc7562187';

export default defineField({
  universalIdentifier: REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'reverseRelationships',
  label: "Related to",
  icon: 'IconAffiliate',
  relationTargetObjectMetadataUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  relationTargetFieldMetadataUniversalIdentifier: RELATED_PERSON_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
