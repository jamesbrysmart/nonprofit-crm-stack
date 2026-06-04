import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { FUNDRAISER_APPEAL_SOURCES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-appeal-sources-on-company.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';

export const FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER =
  '524c0b64-2263-4a2f-bb83-d1cf80b056fe';

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
