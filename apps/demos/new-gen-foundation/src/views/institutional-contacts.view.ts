import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const INSTITUTIONAL_CONTACTS_VIEW_UNIVERSAL_IDENTIFIER =
  '7bcdb7b0-34d0-4d05-99ca-56e19abc4b94';

export default defineView({
  universalIdentifier: INSTITUTIONAL_CONTACTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Institutional contacts",
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: 'TABLE',
  icon: 'IconBuildingBank',
  position: 10,
  fields: [
    { universalIdentifier: '06367729-7fd8-4c10-b1bb-119c0c7245ff', fieldMetadataUniversalIdentifier: '20202020-3875-44d5-8c33-a6239011cab8', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'bd8e0131-7ff7-4e84-9fa4-1cd57244e071', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '1f64a72b-690e-4b32-bf02-163220ba42c3', fieldMetadataUniversalIdentifier: '20202020-b0d0-415a-bef9-640a26dacd9b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '7f8d2ce9-0a79-4bfb-b685-9fd40050ba67', fieldMetadataUniversalIdentifier: '20202020-e2f3-448e-b34c-2d625f0025fd', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'c23ff444-6543-425a-bf3e-5d090afefd20', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: 'e8f76325-61c6-4459-8855-8a4d397316f1', fieldMetadataUniversalIdentifier: 'd3cd88f3-6ece-4a98-ad88-7225cd15b9fb', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: 'b613355a-8049-4b0b-9b6c-6b00e294dff6', fieldMetadataUniversalIdentifier: '20202020-3c51-43fa-8b6e-af39e29368ab', position: 6, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '2aeac2d9-2b08-4797-815c-9e6e332ac704', fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8', operand: ViewFilterOperand.CONTAINS, value: "[\"INSTITUTIONAL_CONTACT\"]" },
  ],
  sorts: [
    { universalIdentifier: '9d10fb85-ea12-4413-acec-5b922522d7ee', fieldMetadataUniversalIdentifier: '0b1ed7be-3579-4f1f-8e06-ec87a2276eb4', direction: ViewSortDirection.DESC },
  ],
});
