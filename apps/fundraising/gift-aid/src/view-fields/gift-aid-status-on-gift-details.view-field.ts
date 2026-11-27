import { GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { defineViewField } from 'twenty-sdk/define';

import {
  FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import {
  GIFT_AID_STATUS_ON_GIFT_DETAILS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: GIFT_AID_STATUS_ON_GIFT_DETAILS_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: GIFT_GIFT_AID_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  position: 100,
  isVisible: true,
});
