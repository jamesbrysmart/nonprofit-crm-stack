import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { RELATED_ORGANISATION_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/related-organisation-on-relationship.field';

export const PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'd7278a15-ffbe-4955-aa44-80b6e1fd5682';

export default defineField({
  universalIdentifier: PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'peopleRelationships',
  label: "People relationships",
  icon: 'IconAffiliate',
  relationTargetObjectMetadataUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  relationTargetFieldMetadataUniversalIdentifier: RELATED_ORGANISATION_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
