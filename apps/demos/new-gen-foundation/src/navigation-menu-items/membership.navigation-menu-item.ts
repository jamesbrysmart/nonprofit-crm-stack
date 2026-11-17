import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '16217ed9-3679-491e-9008-0a850871062b',
  type: NavigationMenuItemType.OBJECT,
  name: 'Memberships',
  icon: 'IconIdBadge2',
  position: 30,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
});
