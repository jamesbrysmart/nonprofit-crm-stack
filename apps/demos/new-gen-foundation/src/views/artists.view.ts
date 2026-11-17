import { defineView, ViewFilterOperand } from 'twenty-sdk/define';

export const ARTISTS_VIEW_UNIVERSAL_IDENTIFIER =
  'ae950383-9b8b-46a3-a249-a87190db2a9a';

export default defineView({
  universalIdentifier: ARTISTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Artists",
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: 'TABLE',
  icon: 'IconMicrophone2',
  position: 10,
  fields: [
    { universalIdentifier: '5b7256ef-e067-4d7e-9185-ae8fb3ae595a', fieldMetadataUniversalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '3d31ad6b-19ec-4757-8b18-35f404b940fd', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'ed512512-09ae-4ef3-9f32-084c2fc44270', fieldMetadataUniversalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: 'cd7de904-f1e7-43b9-9e83-5fe5f18ec78c', fieldMetadataUniversalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'cab11175-b351-4396-b8d8-3c84dccc28b8', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '2475c1c5-d98f-48da-b1d4-e4a05f89927c', fieldMetadataUniversalIdentifier: 'd3cd88f3-6ece-4a98-ad88-7225cd15b9fb', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: 'd6754ee2-634d-4bd3-a190-48478b6ddbbb', fieldMetadataUniversalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab', position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '73a61816-d33a-4a2a-81c6-aff920466320', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', operand: ViewFilterOperand.CONTAINS, value: "[\"ARTIST\"]" },
  ],
});
