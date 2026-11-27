import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  GIFT_AID_CLAIM_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batches-navigation-menu-item',
  icon: 'IconReceiptTax',
  color: 'green',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
