import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    DEFAULT_FUND_APPEALS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'defaultFundAppeals',
  label: 'Default-fund appeals',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
