import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PATRONS_AND_DONORS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/patrons-and-donors.view';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '74a6b3b4-0bae-490c-9230-83d7ed6b7988',
  type: NavigationMenuItemType.VIEW,
  name: 'Patrons and donors',
  icon: 'IconHeartHandshake',
  position: 10,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: PATRONS_AND_DONORS_VIEW_UNIVERSAL_IDENTIFIER,
});
