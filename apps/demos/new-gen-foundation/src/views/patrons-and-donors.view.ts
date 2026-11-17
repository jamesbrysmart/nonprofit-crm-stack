import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const PATRONS_AND_DONORS_VIEW_UNIVERSAL_IDENTIFIER =
  'f9e278e2-cf37-4d78-85e1-78a2902e926b';

export default defineView({
  universalIdentifier: PATRONS_AND_DONORS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Patrons and donors",
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: 'TABLE',
  icon: 'IconHeartHandshake',
  position: 10,
  fields: [
    { universalIdentifier: '1b1e73ec-393b-4c43-a1e7-d322a4c4c52b', fieldMetadataUniversalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'd097ffb4-4370-4212-a205-74d904714ff5', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'd479287c-2a7f-4384-86e1-ee0404809745', fieldMetadataUniversalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '20571bef-a818-4bcb-9080-efac011f569b', fieldMetadataUniversalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '12e21a36-ecac-40a4-b62b-7753ffec7ded', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: 'f6f1c4c3-f9b6-4a0e-b358-c6c49cd6302f', fieldMetadataUniversalIdentifier: 'd3cd88f3-6ece-4a98-ad88-7225cd15b9fb', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: 'ef9d1d07-aeb1-485a-ad72-e4f15942f841', fieldMetadataUniversalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab', position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: 'c20e5293-caaf-4728-8ff7-fea070dc6ee4', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', operand: ViewFilterOperand.CONTAINS, value: "[\"PATRON\", \"DONOR\"]" },
  ],
  sorts: [
    { universalIdentifier: 'bb26fd2f-d9f2-4cd4-b4d9-183ce7e4192d', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', direction: ViewSortDirection.DESC },
  ],
});
