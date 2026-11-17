import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export const FUNDRAISING_FOLDER_UNIVERSAL_IDENTIFIER = 'cf78d223-ba9b-4de1-8ebe-2e467a2a952f';

export default defineNavigationMenuItem({
  universalIdentifier: FUNDRAISING_FOLDER_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.FOLDER,
  name: 'Fundraising',
  icon: 'IconHeartHandshake',
  position: 30,
});
