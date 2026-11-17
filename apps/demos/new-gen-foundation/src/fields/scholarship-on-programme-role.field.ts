import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, OnDeleteAction } from 'twenty-sdk/define';

import { SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/scholarship-holders-on-opportunity.field';

export const SCHOLARSHIP_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  '72d8b102-04a4-4816-ae14-f3e73ae592dd';

export default defineField({
  universalIdentifier: SCHOLARSHIP_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  type: FieldType.RELATION,
  name: 'scholarship',
  label: "Scholarship",
  icon: 'IconSchool',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'scholarshipId',
  },
});
