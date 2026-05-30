import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SOFT_CREDITED_GIFTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/soft-credited-gifts-on-company.field';
import { GIFT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift.object';

export const SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER =
  '8e1f0f9c-8f5a-4840-8fe9-a600eb81aa69';

export default defineField({
  universalIdentifier: SOFT_CREDIT_COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'softCreditCompany',
  label: 'Soft credit company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SOFT_CREDITED_GIFTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'softCreditCompanyId',
  },
});
