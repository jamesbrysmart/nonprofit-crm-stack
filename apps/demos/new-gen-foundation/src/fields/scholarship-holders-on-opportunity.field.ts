import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { SCHOLARSHIP_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/scholarship-on-programme-role.field';

export const SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  'c4a7a73e-d6e8-4656-8c6b-2548789b9c35';

export default defineField({
  universalIdentifier: SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'scholarshipHolders',
  label: "Scholarship holders",
  icon: 'IconSchool',
  relationTargetObjectMetadataUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
  relationTargetFieldMetadataUniversalIdentifier: SCHOLARSHIP_ON_PROGRAMME_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
