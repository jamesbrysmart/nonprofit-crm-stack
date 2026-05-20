import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { APPEALS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/appeals.view';

export const APPEALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '2057139f-e33e-4934-af7d-966d54c9cda5';

export default defineNavigationMenuItem({
  universalIdentifier: APPEALS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'appeals-navigation-menu-item',
  icon: 'IconTargetArrow',
  color: 'orange',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: APPEALS_VIEW_UNIVERSAL_IDENTIFIER,
});
