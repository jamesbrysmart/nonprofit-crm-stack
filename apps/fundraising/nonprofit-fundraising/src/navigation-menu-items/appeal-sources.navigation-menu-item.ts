import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import {
  APPEAL_SOURCES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  APPEAL_SOURCES_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier:
    APPEAL_SOURCES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'appeal-sources-navigation-menu-item',
  icon: 'IconRoute2',
  color: 'orange',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: APPEAL_SOURCES_VIEW_UNIVERSAL_IDENTIFIER,
});
