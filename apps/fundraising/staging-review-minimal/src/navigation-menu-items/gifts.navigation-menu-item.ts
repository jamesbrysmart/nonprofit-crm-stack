import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk';
import { GIFTS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gifts.view';

export default defineNavigationMenuItem({
  universalIdentifier: '0b6b8fc7-a985-4332-a12a-2c51f50d061c',
  name: 'gifts-navigation',
  icon: 'IconGift',
  color: 'green',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFTS_VIEW_UNIVERSAL_IDENTIFIER,
});
