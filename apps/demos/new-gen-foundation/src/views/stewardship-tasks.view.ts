import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const STEWARDSHIP_TASKS_VIEW_UNIVERSAL_IDENTIFIER =
  '8df9fdc9-8f36-441e-86ec-56986de4b4cc';

export default defineView({
  universalIdentifier: STEWARDSHIP_TASKS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Stewardship tasks",
  objectUniversalIdentifier: '20202020-1ba1-48ba-bc83-ef7e5990ed10',
  type: 'TABLE',
  icon: 'IconChecklist',
  position: 10,
  fields: [
    { universalIdentifier: '60e53e35-9861-4eaf-9464-22aa39d4a22d', fieldMetadataUniversalIdentifier: '20202020-b386-4cb7-aa5a-08d4a4d92680', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '34fb8aa8-9a9b-45a7-8b47-677d5bf4a9d3', fieldMetadataUniversalIdentifier: '20202020-fd99-40da-951b-4cb9a352fce3', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'd22ba67a-2dda-401b-9fed-63690a9c2700', fieldMetadataUniversalIdentifier: '20202020-70bc-48f9-89c5-6aa730b151e0', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: 'da9b8441-983e-496b-8e04-14c9b5b1b9fd', fieldMetadataUniversalIdentifier: '20202020-065a-4f42-a906-e20422c1753f', position: 3, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '8219f4f4-2d23-4f38-8195-22dba8e91d18', fieldMetadataUniversalIdentifier: '20202020-70bc-48f9-89c5-6aa730b151e0', operand: ViewFilterOperand.IS, value: "[\"TODO\",\"IN_PROGRESS\"]" },
  ],
  sorts: [
    { universalIdentifier: '03f8efc5-670e-4fc7-8abd-497ab65cf504', fieldMetadataUniversalIdentifier: '20202020-fd99-40da-951b-4cb9a352fce3', direction: ViewSortDirection.ASC },
  ],
});
