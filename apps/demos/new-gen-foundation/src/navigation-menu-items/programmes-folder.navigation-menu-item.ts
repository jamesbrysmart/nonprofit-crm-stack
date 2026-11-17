import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER = '479e9c79-6c41-4ab0-8df7-cc5161c222d6';

export default defineNavigationMenuItem({
  universalIdentifier: PROGRAMMES_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Programmes and events',
  icon: 'IconMasksTheater',
  position: 20,
});
