import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { DEVELOPMENT_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER } from 'src/page-layouts/development-dashboard.page-layout';

export default defineNavigationMenuItem({
  universalIdentifier: '11bb6022-611b-46b6-8922-c0915e504314',
  type: NavigationMenuItemType.PAGE_LAYOUT,
  name: 'Development',
  icon: 'IconLayoutDashboard',
  position: 0,
  pageLayoutUniversalIdentifier: DEVELOPMENT_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
});
