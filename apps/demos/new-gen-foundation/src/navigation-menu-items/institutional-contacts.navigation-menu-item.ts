import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { INSTITUTIONAL_CONTACTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/institutional-contacts.view';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '34dae465-3d1c-4686-91a5-202660e90c76',
  type: NavigationMenuItemType.VIEW,
  name: 'Institutional contacts',
  icon: 'IconBuildingBank',
  position: 50,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: INSTITUTIONAL_CONTACTS_VIEW_UNIVERSAL_IDENTIFIER,
});
