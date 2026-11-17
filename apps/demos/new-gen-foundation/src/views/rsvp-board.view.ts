import { defineView } from 'twenty-sdk/define';

export const RSVP_BOARD_VIEW_UNIVERSAL_IDENTIFIER =
  'a0ebbf62-e202-4e67-8f5f-ca180678e29b';

export default defineView({
  universalIdentifier: RSVP_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  name: "RSVP board",
  objectUniversalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  type: 'KANBAN',
  icon: 'IconLayoutKanban',
  position: 10,
  mainGroupByFieldMetadataUniversalIdentifier: 'a9963296-ed50-488b-92a5-23f82750e8d2',
  fields: [
    { universalIdentifier: 'd444eebb-bdaa-42b4-b162-6e29ec352859', fieldMetadataUniversalIdentifier: '80f8aa74-e6a4-43df-88b4-27d89a7449d4', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'c5c4f842-f10c-439b-a7a2-5c25beb87818', fieldMetadataUniversalIdentifier: '7a151c08-bcde-46f2-8e99-891511475cd7', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'bb80db5d-371e-452a-93e4-0706123b4d75', fieldMetadataUniversalIdentifier: '37f13c26-86f4-4113-91f3-3a40d6c2fe2b', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '30c11a6f-fd18-468d-ba1e-103f91324ae9', fieldMetadataUniversalIdentifier: 'f5cc1672-9606-4688-b471-731b3cb7c9ce', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '73bb3130-c313-4b63-a884-9e580e9c1251', fieldMetadataUniversalIdentifier: '432f5bf1-5fb3-4e2e-a067-e441217ae294', position: 4, isVisible: true, size: 160 },
  ],
  groups: [
    { universalIdentifier: '34104b6d-74ed-4561-a246-75e12aeb1d9c', fieldValue: 'INVITED', position: 0, isVisible: true },
    { universalIdentifier: '18ff5391-e53d-46ba-8ccd-9761c80a3b6a', fieldValue: 'ACCEPTED', position: 1, isVisible: true },
    { universalIdentifier: '8103c01c-63ba-4fd6-83ff-1a4a6f61718b', fieldValue: 'DECLINED', position: 2, isVisible: true },
    { universalIdentifier: '452e1d3d-3aea-424c-9052-7957fc82811b', fieldValue: 'ATTENDED', position: 3, isVisible: true },
    { universalIdentifier: '82d1a7a2-fc60-4bde-a504-e717724086a2', fieldValue: 'NO_SHOW', position: 4, isVisible: true },
  ],
});
