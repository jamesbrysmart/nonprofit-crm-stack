import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    RECURRING_AGREEMENTS_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recurringAgreements',
  label: 'Recurring agreements',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPEAL_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
