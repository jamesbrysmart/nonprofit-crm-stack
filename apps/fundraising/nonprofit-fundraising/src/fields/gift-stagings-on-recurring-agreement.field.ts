import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { RECURRING_AGREEMENT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreement-on-gift-staging.field';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';
import { RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/recurring-agreement.object';

export const GIFT_STAGINGS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER =
  'bb4fc3a1-a2fc-46a8-ad4a-116e33d966b6';

export default defineField({
  universalIdentifier:
    GIFT_STAGINGS_ON_RECURRING_AGREEMENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'giftStagings',
  label: 'Gift staging rows',
  icon: 'IconInbox',
  relationTargetObjectMetadataUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    RECURRING_AGREEMENT_ON_GIFT_STAGING_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
