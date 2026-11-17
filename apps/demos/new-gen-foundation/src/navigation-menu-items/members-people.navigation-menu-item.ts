import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { MEMBERS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/members.view';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '6d173a13-9bf2-4c2a-8d71-40700d3ed9b2',
  type: NavigationMenuItemType.VIEW,
  name: 'Friends and Under-35',
  icon: 'IconId',
  position: 20,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
});
