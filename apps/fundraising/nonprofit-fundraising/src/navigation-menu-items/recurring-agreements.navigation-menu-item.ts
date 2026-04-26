import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { RECURRING_AGREEMENTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/recurring-agreements.view';

export const RECURRING_AGREEMENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '30a4809d-3426-4f85-804a-b57b922868e8';

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
