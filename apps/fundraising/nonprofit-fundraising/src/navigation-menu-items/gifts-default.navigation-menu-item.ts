import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gifts-default.view';

export const GIFTS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '44acbc8f-69cf-41f7-a191-4160fa9e6826';

export default defineNavigationMenuItem({
  universalIdentifier: GIFTS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gifts-navigation-menu-item',
  icon: 'IconGift',
  color: 'green',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFTS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER,
});
