import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { FUNDS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/funds.view';

export const FUNDS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '5b14d2a5-1c73-4bfc-9fe8-8c3b7e831b8f';

export default defineNavigationMenuItem({
  universalIdentifier: FUNDS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'funds-navigation-menu-item',
  icon: 'IconPigMoney',
  color: 'green',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: FUNDS_VIEW_UNIVERSAL_IDENTIFIER,
});
