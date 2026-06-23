import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  NEW_GIFT_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/front-components/new-gift.front-component';

export default defineCommandMenuItem({
  universalIdentifier: NEW_GIFT_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'New gift',
  shortLabel: 'New gift',
  isPinned: true,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
