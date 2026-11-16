import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  DONATION_FORMS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  DONATION_FORMS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
