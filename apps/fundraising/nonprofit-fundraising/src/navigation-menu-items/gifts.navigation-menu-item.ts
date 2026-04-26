import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gifts.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'e0404d8f-62f2-4b58-b04c-4382083a534b',
  name: 'gifts-navigation-menu-item',
  icon: 'IconGift',
  color: 'green',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFTS_VIEW_UNIVERSAL_IDENTIFIER,
});
