import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { FUNDRAISER_COMPANY_ON_APPEAL_SOURCE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-company-on-appeal-source.field';
import { APPEAL_SOURCE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/appeal-source.object';

export const FUNDRAISER_APPEAL_SOURCES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  'f0f78a3b-651c-4088-b9e0-8edb43a0b9f2';

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
