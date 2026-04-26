import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';
import { GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-aid-claim-batches.view';

export const GIFT_AID_CLAIM_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '87c1ca1b-9e5d-4952-957b-83ecbb5ef133';

export default defineNavigationMenuItem({
  universalIdentifier:
    GIFT_AID_CLAIM_BATCHES_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'gift-aid-claim-batches-navigation-menu-item',
  icon: 'IconReceiptTax',
  color: 'green',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
