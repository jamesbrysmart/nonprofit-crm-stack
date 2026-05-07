import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFT_STAGINGS_DEFAULT_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-stagings-default.view';

export const GIFT_STAGINGS_DEFAULT_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'e4b68ccc-4d1a-4e29-a1b7-9a26d7c7fe6d';

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
