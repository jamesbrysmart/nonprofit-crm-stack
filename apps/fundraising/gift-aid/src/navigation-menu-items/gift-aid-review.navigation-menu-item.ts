import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { GIFT_AID_NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '3d4b6323-1bbb-449a-979c-bc3464042a09',
  name: 'gift-aid-review',
  icon: 'IconAlertCircle',
  color: 'green',
  position: 6,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: GIFT_AID_NEEDS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
});
