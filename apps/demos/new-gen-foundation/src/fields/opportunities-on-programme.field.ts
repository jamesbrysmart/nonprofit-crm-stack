import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { PROGRAMME_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-on-opportunity.field';

export const OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER =
  'e0462a6b-af9a-460e-bb7d-9f8eb01edb52';

export default defineField({
  universalIdentifier: OPPORTUNITIES_ON_PROGRAMME_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
  type: FieldType.RELATION,
  name: 'opportunities',
  label: "Opportunities",
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PROGRAMME_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
