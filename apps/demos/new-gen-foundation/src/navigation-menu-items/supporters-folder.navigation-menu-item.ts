import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER = 'aaa84180-e629-4715-8ddd-82d6abdaec73';

export default defineNavigationMenuItem({
  universalIdentifier: SUPPORTERS_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Supporters',
  icon: 'IconUsers',
  position: 10,
});
