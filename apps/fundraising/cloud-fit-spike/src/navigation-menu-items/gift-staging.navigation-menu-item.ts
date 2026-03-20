import { defineNavigationMenuItem } from 'twenty-sdk';
import { GIFT_STAGING_INDEX_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/gift-staging-index.view';

export default defineNavigationMenuItem({
  universalIdentifier: '63615e5d-2b8f-4703-8f7a-657cd7dce27d',
  name: 'gift-staging-navigation-menu-item',
  icon: 'IconInbox',
  color: 'blue',
  position: 0,
  viewUniversalIdentifier: GIFT_STAGING_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
});
