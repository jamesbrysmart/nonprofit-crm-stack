import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const PROCESSING_FOLDER_UNIVERSAL_IDENTIFIER = 'ff84fedf-1a17-4812-8634-2b6f462aebf4';

export default defineNavigationMenuItem({
  universalIdentifier: PROCESSING_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Gift processing',
  icon: 'IconInbox',
  position: 40,
});
