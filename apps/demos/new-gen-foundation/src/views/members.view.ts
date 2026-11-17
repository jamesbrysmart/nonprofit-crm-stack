import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const MEMBERS_VIEW_UNIVERSAL_IDENTIFIER =
  '453fff5c-0dd9-44ec-ba2d-505eac2cb6df';

export default defineView({
  universalIdentifier: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Friends and Under-35",
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: 'TABLE',
  icon: 'IconId',
  position: 10,
  fields: [
    { universalIdentifier: '2d0d3a69-f6f0-4ba0-a52e-5d22bae385bf', fieldMetadataUniversalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '71ae2bf3-3a07-4ca3-9f74-e2e04eb0782a', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '78a803e5-85cc-47b6-b017-6f95ab26bb4c', fieldMetadataUniversalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '97343494-eac7-4e94-875f-a5cba810399a', fieldMetadataUniversalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '83e18f58-3d5b-49e4-922c-452776c2683f', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '6c59d7dd-4755-4eb5-bb65-4184c4564c7a', fieldMetadataUniversalIdentifier: 'd3cd88f3-6ece-4a98-ad88-7225cd15b9fb', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: 'e8ca2100-5a25-47e6-8329-476db19faa22', fieldMetadataUniversalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab', position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '48b743f4-0ca9-474f-aa55-2af65a4fb2fc', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', operand: ViewFilterOperand.CONTAINS, value: "[\"FRIEND\", \"UNDER_35\"]" },
  ],
  sorts: [
    { universalIdentifier: 'd8b1213d-11db-4159-a518-c7e1c9b91f45', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', direction: ViewSortDirection.DESC },
  ],
});
