import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { CULTIVATION_PIPELINE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/cultivation-pipeline.view';
import { FUNDRAISING_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/navigation-menu-items/fundraising-folder.navigation-menu-item';

export default defineNavigationMenuItem({
  universalIdentifier: '15483ed0-d2be-4fa6-8f86-6cb1f5e4b58e',
  type: NavigationMenuItemType.VIEW,
  name: 'Cultivation pipeline',
  icon: 'IconLayoutKanban',
  position: 10,
  folderUniversalIdentifier: FUNDRAISING_FOLDER_UNIVERSAL_IDENTIFIER,
  viewUniversalIdentifier: CULTIVATION_PIPELINE_VIEW_UNIVERSAL_IDENTIFIER,
});
