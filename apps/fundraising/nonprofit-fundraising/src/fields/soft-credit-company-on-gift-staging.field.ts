import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  SOFT_CREDITED_GIFT_STAGINGS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  SOFT_CREDIT_COMPANY_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    SOFT_CREDIT_COMPANY_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'softCreditCompany',
  label: 'Soft credit company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDITED_GIFT_STAGINGS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'softCreditCompanyId',
  },
});
