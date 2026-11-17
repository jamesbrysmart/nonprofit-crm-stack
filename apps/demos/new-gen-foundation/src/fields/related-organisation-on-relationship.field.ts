import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/people-relationships-on-company.field';

export const RELATED_ORGANISATION_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER =
  'ddd10888-d23b-4035-9f51-908fb966789c';

export default defineField({
  universalIdentifier: RELATED_ORGANISATION_ON_RELATIONSHIP_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
  type: FieldType.RELATION,
  name: 'relatedOrganisation',
  label: "Related organisation",
  icon: 'IconBuilding',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'relatedOrganisationId',
  },
});
