import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { FUNDRAISER_APPEAL_SOURCES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-appeal-sources-on-person.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';

export const FUNDRAISER_PERSON_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  'e8c2f9cd-1ddf-45dc-bc4a-eb1aa4f6515c';

export default defineField({
  universalIdentifier:
    FUNDRAISER_PERSON_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'fundraiserPerson',
  label: 'Fundraiser person',
  icon: 'IconUserHeart',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    FUNDRAISER_APPEAL_SOURCES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'fundraiserPersonId',
  },
});
