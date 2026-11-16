import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  CHECK_SELECTED_GIFT_STAGING_READINESS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  CHECK_SELECTED_GIFT_STAGING_READINESS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier:
    CHECK_SELECTED_GIFT_STAGING_READINESS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Check if ready',
  shortLabel: 'Check ready',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    CHECK_SELECTED_GIFT_STAGING_READINESS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
