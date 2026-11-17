import { defineView, ViewSortDirection } from 'twenty-sdk/define';

export const RECENT_GIFTS_VIEW_UNIVERSAL_IDENTIFIER =
  '6fac1f76-9fc2-432d-9475-33347c57e4de';

export default defineView({
  universalIdentifier: RECENT_GIFTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Recent gifts",
  objectUniversalIdentifier: 'c48159d8-b904-4f31-b2ef-a8a27d0df848',
  type: 'TABLE',
  icon: 'IconGift',
  position: 10,
  fields: [
    { universalIdentifier: '6f9da09e-8dc5-4e73-b688-7fd9e09a18b8', fieldMetadataUniversalIdentifier: '54717f2c-e673-45a8-9771-c31cc093c0f8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '316d9b92-2b48-4016-a1d3-d9c4eb5e1570', fieldMetadataUniversalIdentifier: '9c458777-e7ad-45bc-ac87-1bd539a64543', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'eea0e1cc-1bf8-4f5f-b8eb-1813aa95c3c0', fieldMetadataUniversalIdentifier: '85198e1e-135b-47bf-bbd9-83c75f1c3989', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '1662e2f5-f5f8-4b9d-9f77-8ee16764b819', fieldMetadataUniversalIdentifier: '993e89d3-5b1d-4f47-ad42-d438ea9fb326', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'ad026761-e31c-4120-b2c6-7df980fc89bd', fieldMetadataUniversalIdentifier: '51c1028e-2530-40a2-bcf1-c0fab5acb048', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '734aaeea-dc49-4c0f-aca0-cba240ea71a8', fieldMetadataUniversalIdentifier: 'af45e7fc-3dba-4899-bbde-3d801050b081', position: 5, isVisible: true, size: 160 },
  ],
  sorts: [
    { universalIdentifier: 'fdc71f4f-044c-4f3b-ae07-74dd50eb29cd', fieldMetadataUniversalIdentifier: '993e89d3-5b1d-4f47-ad42-d438ea9fb326', direction: ViewSortDirection.DESC },
  ],
});
