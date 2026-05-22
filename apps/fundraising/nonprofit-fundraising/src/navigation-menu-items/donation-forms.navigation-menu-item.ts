import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { DONATION_FORMS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/donation-forms.view';

export const DONATION_FORMS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '81f182f6-f15e-4cb8-8f75-73277d69ccb1';

export default defineNavigationMenuItem({
  universalIdentifier:
    DONATION_FORMS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'donation-forms-navigation-menu-item',
  icon: 'IconHeartHandshake',
  color: 'pink',
  position: 7,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: DONATION_FORMS_VIEW_UNIVERSAL_IDENTIFIER,
});
