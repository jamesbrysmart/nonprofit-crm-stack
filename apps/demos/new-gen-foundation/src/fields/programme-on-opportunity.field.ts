import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/opportunities-on-programme.field';

export const PROGRAMME_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  'f9eff743-c874-42b9-b4cb-ed07e7468697';

export default defineField({
  universalIdentifier: PROGRAMME_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'programme',
  label: "Programme",
  icon: 'IconMasksTheater',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  relationTargetFieldMetadataUniversalIdentifier: OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'programmeId',
  },
});
