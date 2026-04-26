import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/recurring-agreement.object';

export const RECURRING_AGREEMENTS_VIEW_UNIVERSAL_IDENTIFIER =
  '4c3408a0-8904-48b1-99d5-bd7e0329db5f';

export default defineView({
  universalIdentifier: RECURRING_AGREEMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Recurring agreements',
  objectUniversalIdentifier: RECURRING_AGREEMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconRepeat',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'f653c1a9-489d-48cb-a869-074fe2588e83',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'f991484f-d790-4890-83d1-c00df9675fa2',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '3be98f12-c652-45db-bb85-68a19dcf65a5',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_CADENCE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '64401af7-4197-4d42-a6b0-4874224bd2c9',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'ee5cc8fe-f74d-4d44-9cd0-e4620ba1399c',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_NEXT_EXPECTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '4d3f0798-44e4-4699-9998-bc2621ee13ef',
      fieldMetadataUniversalIdentifier:
        RECURRING_AGREEMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 140,
    },
  ],
});
