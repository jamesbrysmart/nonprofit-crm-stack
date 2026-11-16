import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  FUNDRAISER_APPEAL_SOURCES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    FUNDRAISER_APPEAL_SOURCES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'fundraiserAppealSources',
  label: 'Fundraiser appeal sources',
  icon: 'IconRoute2',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
