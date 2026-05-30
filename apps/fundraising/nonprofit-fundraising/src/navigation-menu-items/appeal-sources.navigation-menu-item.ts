import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { APPEAL_SOURCES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/appeal-sources.view';

export const APPEAL_SOURCES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '1ff137c1-2cb6-46ff-a8e2-4d66338e194c';

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
