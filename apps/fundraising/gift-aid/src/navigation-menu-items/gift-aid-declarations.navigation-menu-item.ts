import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { GIFT_AID_DECLARATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: 'ab1b5a6d-f9fa-459a-93e7-df13709d207b',
  name: 'gift-aid-declarations',
  icon: 'IconFileCertificate',
  color: 'green',
  position: 5,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_AID_DECLARATIONS_VIEW_UNIVERSAL_IDENTIFIER,
});
