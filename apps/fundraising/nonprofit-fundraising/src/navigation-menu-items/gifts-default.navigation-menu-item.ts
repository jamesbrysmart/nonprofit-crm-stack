import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  GIFTS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: GIFTS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gifts-navigation-menu-item',
  icon: 'IconGift',
  color: 'green',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
});
