import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  RECURRING_AGREEMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  RECURRING_AGREEMENTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    RECURRING_AGREEMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'recurring-agreements-navigation-menu-item',
  icon: 'IconRepeat',
  color: 'blue',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RECURRING_AGREEMENTS_VIEW_UNIVERSAL_IDENTIFIER,
});
