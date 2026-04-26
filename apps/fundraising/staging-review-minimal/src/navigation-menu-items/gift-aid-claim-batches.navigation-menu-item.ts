import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk';
import { GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-aid-claim-batches.view';

export default defineNavigationMenuItem({
  universalIdentifier: '12dc9488-6d09-4d67-bfde-e23718a81f8f',
  name: 'gift-aid-claim-batches-navigation',
  icon: 'IconReceiptTax',
  color: 'green',
  position: 35,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_AID_CLAIM_BATCHES_VIEW_UNIVERSAL_IDENTIFIER,
});
