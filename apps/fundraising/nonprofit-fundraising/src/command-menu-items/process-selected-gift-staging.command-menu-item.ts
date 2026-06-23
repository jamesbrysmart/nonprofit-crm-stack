import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  PROCESS_SELECTED_GIFT_STAGING_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  PROCESS_SELECTED_GIFT_STAGING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/front-components/process-selected-gift-staging.front-component';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export default defineCommandMenuItem({
  universalIdentifier:
    PROCESS_SELECTED_GIFT_STAGING_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Process selected',
  shortLabel: 'Process',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    PROCESS_SELECTED_GIFT_STAGING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
