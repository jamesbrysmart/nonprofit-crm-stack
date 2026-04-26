import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk';
import { GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-batches.view';

export default defineNavigationMenuItem({
  universalIdentifier: '3771f655-4258-49f0-b994-58c2c3e5e949',
  name: 'gift-batches-navigation',
  icon: 'IconStack2',
  color: 'violet',
  position: 25,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
