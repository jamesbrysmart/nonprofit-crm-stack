import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/programmes-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '30f9a2eb-5701-436b-971c-507124364f0a',
  type: NavigationMenuItemType.OBJECT,
  name: 'Programmes',
  icon: 'IconMasksTheater',
  position: 10,
  folderUniversalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: '5d748db1-ad39-4b81-abb4-67a8d73708c3',
});
