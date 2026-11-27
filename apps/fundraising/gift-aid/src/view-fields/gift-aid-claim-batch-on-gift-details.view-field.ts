import { defineViewField } from 'twenty-sdk/define';
import {
  FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import { GIFT_AID_CLAIM_BATCH_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'bb1ee5c7-f0ec-4fc6-be6a-aafb02188e58',
  viewUniversalIdentifier: FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: GIFT_AID_CLAIM_BATCH_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 103,
  isVisible: true,
});
