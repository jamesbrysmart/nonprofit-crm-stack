import { defineViewField } from 'twenty-sdk/define';
import {
  FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';
import { GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '07024c50-6cc5-4d04-88a3-0aa4e117cea7',
  viewUniversalIdentifier: FUNDRAISING_GIFT_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier:
    FUNDRAISING_GIFT_DETAILS_FUNDRAISING_CONTEXT_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: GIFT_AID_DECLARATION_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
  position: 102,
  isVisible: true,
});
