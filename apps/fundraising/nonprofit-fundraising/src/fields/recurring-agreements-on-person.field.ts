import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-recurring-agreement.field';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  'b1dc6b70-ed93-48ea-8ba0-6270548b9d5e';

export default defineField({
  universalIdentifier: RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'recurringAgreements',
  label: 'Recurring agreements',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PERSON_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
