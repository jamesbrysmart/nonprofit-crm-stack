import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  GIFT_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: GIFT_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-batches-navigation-menu-item',
  icon: 'IconStack2',
  color: 'orange',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
