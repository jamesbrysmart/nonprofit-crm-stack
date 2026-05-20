import { defineView, ViewKey } from 'twenty-sdk/define';
import { DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/default-fund-on-appeal.field';
import {
  APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/appeal.object';

export const APPEALS_VIEW_UNIVERSAL_IDENTIFIER =
  'ee4cb5cb-3fd4-42bb-baf7-95a6987551cb';

export default defineView({
  universalIdentifier: APPEALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Appeals',
  objectUniversalIdentifier: APPEAL_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconTargetArrow',
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: '1e52d152-24fe-457d-b530-88b931f8bb03',
      fieldMetadataUniversalIdentifier: APPEAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'ef7a695a-68f2-4ee9-b1cf-7d191ec174f9',
      fieldMetadataUniversalIdentifier: APPEAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '166e0164-f00d-454c-a75d-d4e7057c86b1',
      fieldMetadataUniversalIdentifier: APPEAL_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'f2356cc5-671f-4a47-b1be-5e242fdd205d',
      fieldMetadataUniversalIdentifier:
        DEFAULT_FUND_ON_APPEAL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a1d41f77-282a-4cf6-8450-1588e0902c8b',
      fieldMetadataUniversalIdentifier:
        APPEAL_GOAL_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '251ad63c-ee7d-4432-86b9-6db6de9f9cc9',
      fieldMetadataUniversalIdentifier:
        APPEAL_RAISED_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '667d6427-90bb-4d7e-b292-588f2b4eb22b',
      fieldMetadataUniversalIdentifier:
        APPEAL_GIFT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '3f851735-fb14-4a4d-89d7-d6c2374d779a',
      fieldMetadataUniversalIdentifier:
        APPEAL_DONOR_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'd7e34d20-e5b8-4687-8d7e-cf6c9b5c651d',
      fieldMetadataUniversalIdentifier:
        APPEAL_LAST_GIFT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 160,
    },
  ],
});
