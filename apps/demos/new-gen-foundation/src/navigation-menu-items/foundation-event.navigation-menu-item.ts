import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/programmes-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '1a420211-c37c-48e4-a409-f5ff41fa249f',
  type: NavigationMenuItemType.OBJECT,
  name: 'Events',
  icon: 'IconCalendarEvent',
  position: 20,
  folderUniversalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
});
