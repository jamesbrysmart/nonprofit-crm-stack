import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/programmes-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'fe586302-3e05-4a2a-9210-65cfe536b048',
  type: NavigationMenuItemType.OBJECT,
  name: 'Programme roles',
  icon: 'IconMicrophone2',
  position: 50,
  folderUniversalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: '8ce953a4-b26d-4103-8b18-5b2ecf610796',
});
