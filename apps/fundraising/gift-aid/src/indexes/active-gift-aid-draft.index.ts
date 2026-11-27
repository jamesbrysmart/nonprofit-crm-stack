import { defineIndex } from 'twenty-sdk/define';
import {
  ACTIVE_GIFT_AID_DRAFT_KEY_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineIndex({
  universalIdentifier: '75c558da-ca2e-4524-aaab-75343893ba64',
  objectUniversalIdentifier: GIFT_AID_CLAIM_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  isUnique: true,
  fields: [
    {
      universalIdentifier: '36afd80a-005f-478e-88e9-5c3c3fe28bff',
      fieldUniversalIdentifier: ACTIVE_GIFT_AID_DRAFT_KEY_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ],
});
