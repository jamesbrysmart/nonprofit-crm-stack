import { defineViewField } from 'twenty-sdk/define';
import {
  FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import { GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: 'f221d62a-46fa-413f-afa4-1fca87c38cdc',
  viewUniversalIdentifier: FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: GIFT_GIFT_AID_REASON_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  position: 101,
  isVisible: true,
});
