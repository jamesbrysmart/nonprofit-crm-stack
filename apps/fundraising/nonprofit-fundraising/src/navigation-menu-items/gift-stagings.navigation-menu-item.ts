import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFT_STAGINGS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-stagings.view';

export const GIFT_STAGINGS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '96c50fbb-e216-4110-ad6f-49800d87c04d';

export default defineNavigationMenuItem({
  universalIdentifier: GIFT_STAGINGS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-stagings-navigation-menu-item',
  icon: 'IconInbox',
  color: 'blue',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_STAGINGS_VIEW_UNIVERSAL_IDENTIFIER,
});
