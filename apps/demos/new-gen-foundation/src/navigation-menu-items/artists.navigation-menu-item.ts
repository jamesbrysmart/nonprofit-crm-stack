import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { ARTISTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/artists.view';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'bad5a4ac-5b0c-462b-b553-0ebab77589ce',
  type: NavigationMenuItemType.VIEW,
  name: 'Artists',
  icon: 'IconMicrophone2',
  position: 40,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: ARTISTS_VIEW_UNIVERSAL_IDENTIFIER,
});
