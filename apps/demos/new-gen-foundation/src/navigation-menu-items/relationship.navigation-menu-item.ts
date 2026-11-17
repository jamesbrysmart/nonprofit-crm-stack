import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/supporters-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: 'c9fbab80-8079-4d0e-856f-d6976ea8dfcc',
  type: NavigationMenuItemType.OBJECT,
  name: 'Relationships',
  icon: 'IconAffiliate',
  position: 70,
  folderUniversalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  targetObjectUniversalIdentifier: '4476f7e2-d564-45c7-98b3-083003c22f36',
});
