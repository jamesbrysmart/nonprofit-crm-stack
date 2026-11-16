import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  GIFT_STAGINGS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GIFT_STAGINGS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    GIFT_STAGINGS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-stagings-navigation-menu-item',
  icon: 'IconInbox',
  color: 'blue',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_STAGINGS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
});
