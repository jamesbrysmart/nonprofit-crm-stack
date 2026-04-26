import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';
import { GIFT_STAGINGS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-stagings-on-recurring-agreement.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const RECURRING_AGREEMENT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER =
  '04cb00b5-dfa8-4d02-abde-b57d431da9ee';

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
