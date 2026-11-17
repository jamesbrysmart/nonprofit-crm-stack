import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { RSVP_BOARD_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/rsvp-board.view';
import { PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/programmes-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '1db1dba0-2911-45b9-8077-31503dd60ddf',
  type: NavigationMenuItemType.VIEW,
  name: 'RSVP board',
  icon: 'IconLayoutKanban',
  position: 30,
  folderUniversalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: RSVP_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
});
