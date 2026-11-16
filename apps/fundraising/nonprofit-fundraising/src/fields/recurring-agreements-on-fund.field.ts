import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: RECURRING_AGREEMENTS_ON_FUND_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recurringAgreements',
  label: 'Recurring agreements',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    FUND_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
