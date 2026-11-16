import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  APPEALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  APPEALS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: APPEALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'appeals-navigation-menu-item',
  icon: 'IconTargetArrow',
  color: 'orange',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: APPEALS_VIEW_UNIVERSAL_IDENTIFIER,
});
