import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  FUNDS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  FUNDS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: FUNDS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'funds-navigation-menu-item',
  icon: 'IconPigMoney',
  color: 'green',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: FUNDS_VIEW_UNIVERSAL_IDENTIFIER,
});
