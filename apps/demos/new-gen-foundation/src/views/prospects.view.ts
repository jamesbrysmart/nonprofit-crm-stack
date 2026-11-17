import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const PROSPECTS_VIEW_UNIVERSAL_IDENTIFIER =
  '96210c9f-39b7-446a-baa5-c96a66710c33';

export default defineView({
  universalIdentifier: PROSPECTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Prospects",
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: 'TABLE',
  icon: 'IconTargetArrow',
  position: 10,
  fields: [
    { universalIdentifier: '4ad65fdf-6324-4084-9abb-4f967c5c4281', fieldMetadataUniversalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '8d4d8030-d5e3-4773-ba94-6dc96b8e126c', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'd1e564ca-8437-4797-be71-ef073fe39e02', fieldMetadataUniversalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '35516da7-632d-4d97-b3c4-f37bbec69991', fieldMetadataUniversalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'af848e7a-d9ec-45d3-aff0-af94df3d843f', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: '621aba10-ffa5-4180-aac9-7fc7936c9fc1', fieldMetadataUniversalIdentifier: 'd3cd88f3-6ece-4a98-ad88-7225cd15b9fb', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: 'ddc9950e-c29b-45c3-b7ec-85d8b49dd982', fieldMetadataUniversalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab', position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '1c8f475b-e96e-462e-ac38-f3824499264a', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', operand: ViewFilterOperand.CONTAINS, value: "[\"PROSPECT\"]" },
  ],
  sorts: [
    { universalIdentifier: '5379bce9-33e1-4b84-8134-4c5968edc620', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', direction: ViewSortDirection.DESC },
  ],
});
