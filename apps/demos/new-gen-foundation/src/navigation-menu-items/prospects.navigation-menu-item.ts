import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROSPECTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/prospects.view';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '5ca50a31-e3cf-4c56-8313-229846e8bfed',
  type: NavigationMenuItemType.VIEW,
  name: 'Prospects',
  icon: 'IconTargetArrow',
  position: 60,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: PROSPECTS_VIEW_UNIVERSAL_IDENTIFIER,
});
