import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import {
  GIFT_STAGINGS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    RECURRING_AGREEMENT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'recurringAgreement',
  label: 'Recurring agreement',
  icon: 'IconRepeat',
  relationTargetObjectMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    GIFT_STAGINGS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'recurringAgreementId',
  },
});
