import {
  defineField,
  FieldType,
  OnDeleteAction,
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
    FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'fundraiserCompany',
  label: 'Fundraiser company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    FUNDRAISER_APPEAL_SOURCES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'fundraiserCompanyId',
  },
});
