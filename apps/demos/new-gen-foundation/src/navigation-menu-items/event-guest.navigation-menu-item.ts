import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/programmes-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'a1a1a18a-c566-4527-86e4-f5de373de1a0',
  type: NavigationMenuItemType.OBJECT,
  name: 'Event guests',
  icon: 'IconTicket',
  position: 40,
  folderUniversalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
});
