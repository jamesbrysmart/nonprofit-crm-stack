import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const RENEWALS_DUE_VIEW_UNIVERSAL_IDENTIFIER =
  'cd3fb4ca-a77b-441f-931d-560b42f3c601';

export default defineView({
  universalIdentifier: RENEWALS_DUE_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Renewals due",
  objectUniversalIdentifier: '3aeacd8c-20e3-4649-8de9-606dd3ac60d1',
  type: 'TABLE',
  icon: 'IconCalendarDue',
  position: 10,
  fields: [
    { universalIdentifier: 'ba4dd6aa-9036-4b09-861f-e001e6d7f916', fieldMetadataUniversalIdentifier: 'c4ef5fe6-6fae-49af-9d1a-2007b826d867', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '2f2e8829-d237-4c7c-8231-d611fc0627e2', fieldMetadataUniversalIdentifier: '89c94592-eeda-4723-b230-48bfea482aab', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '535640a6-f3b2-4eec-9af2-52bfb82c47a9', fieldMetadataUniversalIdentifier: '2bc77f4b-cdce-4276-93c2-8ca4cd3e4962', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '34f24489-54a5-4b2f-8ccd-01ab823e2fa6', fieldMetadataUniversalIdentifier: '01b4e1f7-17b4-4b87-a55f-42b7edc5a302', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: 'c1bdd222-1346-4c76-9812-48f66ea29b17', fieldMetadataUniversalIdentifier: '528739a4-e9fa-4408-ac28-f5352a4a9e50', position: 4, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: 'df63f813-f6b0-426b-b746-2735ebdf1e23', fieldMetadataUniversalIdentifier: '01b4e1f7-17b4-4b87-a55f-42b7edc5a302', operand: ViewFilterOperand.IS, value: "[\"RENEWAL_DUE\"]" },
  ],
  sorts: [
    { universalIdentifier: 'b1442919-13fd-4361-93b9-6169359f34b9', fieldMetadataUniversalIdentifier: '2bc77f4b-cdce-4276-93c2-8ca4cd3e4962', direction: ViewSortDirection.ASC },
  ],
});
