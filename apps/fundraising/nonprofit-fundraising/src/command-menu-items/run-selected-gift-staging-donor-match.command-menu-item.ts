import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/front-components/run-selected-gift-staging-donor-match.front-component';
import { GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-staging.object';

export default defineCommandMenuItem({
  universalIdentifier:
    RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Run donor match',
  shortLabel: 'Donor match',
  icon: 'IconUserSearch',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    GIFT_STAGING_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
