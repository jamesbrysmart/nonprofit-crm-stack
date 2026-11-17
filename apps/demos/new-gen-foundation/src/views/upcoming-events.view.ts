import { defineView, ViewFilterOperand, ViewSortDirection } from 'twenty-sdk/define';

export const UPCOMING_EVENTS_VIEW_UNIVERSAL_IDENTIFIER =
  'f1df2d82-5cb6-460a-a7b7-cbf7b3ddd508';

export default defineView({
  universalIdentifier: UPCOMING_EVENTS_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Upcoming events",
  objectUniversalIdentifier: '420545c0-c547-43a1-b729-8e08b3385492',
  type: 'TABLE',
  icon: 'IconCalendarDue',
  position: 10,
  fields: [
    { universalIdentifier: '989b0618-eb1d-4c0c-8c0f-fb012c93db93', fieldMetadataUniversalIdentifier: '32dab705-a138-4b41-9d93-a7153d7ae5fa', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'ca59a576-75d9-4114-87fb-7a3242b78c77', fieldMetadataUniversalIdentifier: '5533c465-7957-4d4b-a8be-327fc1403d16', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'd3107f1c-8ef4-42fa-bdb9-b91f5fb3fc2a', fieldMetadataUniversalIdentifier: '1abcdb17-bbd7-401a-b537-c32e3109824a', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: 'f42e1377-df2a-434e-bfd9-b0a2f6f9c273', fieldMetadataUniversalIdentifier: 'f67b301a-20b0-4075-bd05-a7390c819d69', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '1ca468e4-c3a5-4afe-acba-3d3eef0b1b3b', fieldMetadataUniversalIdentifier: 'cc13b176-4a15-4973-b7de-4a1f8f0f1644', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: 'c83b6151-2bf0-4614-81af-664fbd00c8f8', fieldMetadataUniversalIdentifier: 'fbfade30-d3e0-407a-82e4-b72f1a687be5', position: 5, isVisible: true, size: 160 },
    { universalIdentifier: '0b7baaa4-6d53-465e-bc92-8335aad62d1b', fieldMetadataUniversalIdentifier: 'a327a5e1-afcb-4412-ba9b-08c09b9d2d2b', position: 6, isVisible: true, size: 160 },
    { universalIdentifier: '6a6a2d93-b514-4c39-a01e-24bf25b1a5ab', fieldMetadataUniversalIdentifier: '1af49e02-d94f-4486-bc02-6e2584d97756', position: 7, isVisible: true, size: 160 },
  ],
  filters: [
    { universalIdentifier: '346db5f5-c97e-4331-b31a-65dc61f8f7cc', fieldMetadataUniversalIdentifier: '5533c465-7957-4d4b-a8be-327fc1403d16', operand: ViewFilterOperand.IS_IN_FUTURE, value: "" },
  ],
  sorts: [
    { universalIdentifier: '43e5436e-012f-4abd-a1d0-6df19d61e501', fieldMetadataUniversalIdentifier: '5533c465-7957-4d4b-a8be-327fc1403d16', direction: ViewSortDirection.ASC },
  ],
});
