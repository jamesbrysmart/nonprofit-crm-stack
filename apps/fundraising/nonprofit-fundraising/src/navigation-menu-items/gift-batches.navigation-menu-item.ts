import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-batches.view';

export const GIFT_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '7f2f7b70-77a8-4ba1-a9b0-d5f3a3cb58b7';

export default defineNavigationMenuItem({
  universalIdentifier: GIFT_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-batches-navigation-menu-item',
  icon: 'IconStack2',
  color: 'orange',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
