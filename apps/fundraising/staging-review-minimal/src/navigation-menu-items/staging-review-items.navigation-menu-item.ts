import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk';
import { STAGING_REVIEW_ITEMS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/staging-review-items.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'f8f6cfb5-ae07-4d84-8181-febfce42f0ef',
  name: 'staging-review-queue-navigation',
  icon: 'IconInbox',
  color: 'blue',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: STAGING_REVIEW_ITEMS_VIEW_UNIVERSAL_IDENTIFIER,
});
