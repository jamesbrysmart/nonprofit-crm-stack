import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-appeal-source.field';
import { APPEAL_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal.object';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';

export const APPEAL_SOURCES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER =
  '2ea8444e-9ea0-4db2-a7cd-c7b54772c06e';

export default defineField({
  universalIdentifier: APPEAL_SOURCES_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'appealSources',
  label: 'Appeal sources',
  icon: 'IconRoute2',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
