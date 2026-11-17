import { defineView, AggregateOperations } from 'twenty-sdk/define';

export const CULTIVATION_PIPELINE_VIEW_UNIVERSAL_IDENTIFIER =
  '3bc2b3cb-f9ec-4202-8e8a-e8dae95092e9';

export default defineView({
  universalIdentifier: CULTIVATION_PIPELINE_VIEW_UNIVERSAL_IDENTIFIER,
  name: "Cultivation pipeline",
  objectUniversalIdentifier: '20202020-9549-49dd-b2b2-883999db8938',
  type: 'KANBAN',
  icon: 'IconLayoutKanban',
  position: 10,
  mainGroupByFieldMetadataUniversalIdentifier: '20202020-6f76-477d-8551-28cd65b2b4b9',
  kanbanAggregateOperation: AggregateOperations.SUM,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f',
  fields: [
    { universalIdentifier: 'e14437fd-25e5-40ed-a05d-ab3465299826', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '0a83e539-fb00-4930-b460-bcf40f81e7f6', fieldMetadataUniversalIdentifier: '20202020-583e-4642-8533-db761d5fa82f', position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '819ce290-d872-4050-879c-09bbdc514ba5', fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f', position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '1e01f0f7-0b41-43e4-a221-812b3238fd00', fieldMetadataUniversalIdentifier: '20202020-8dfb-42fc-92b6-01afb759ed16', position: 3, isVisible: true, size: 160 },
    { universalIdentifier: '4ccdfbe8-eff9-442b-9fd4-f4f43d61370b', fieldMetadataUniversalIdentifier: '20202020-527e-44d6-b1ac-c4158d307b97', position: 4, isVisible: true, size: 160 },
    { universalIdentifier: 'b83cb055-2092-40f4-a6cd-65db0419f81f', fieldMetadataUniversalIdentifier: 'f9eff743-c874-42b9-b4cb-ed07e7468697', position: 5, isVisible: true, size: 160 },
  ],
  groups: [
    { universalIdentifier: '53e497d8-cd40-4c85-b05a-670e54eb6714', fieldValue: 'NEW', position: 0, isVisible: true },
    { universalIdentifier: '6132703d-5c78-4d1b-bb6e-7f9afc2f8e82', fieldValue: 'SCREENING', position: 1, isVisible: true },
    { universalIdentifier: 'b666c7ad-7363-450f-96b3-42f67b86d88e', fieldValue: 'MEETING', position: 2, isVisible: true },
    { universalIdentifier: 'e77b4904-93f7-40dd-b5f4-ee02e81f3239', fieldValue: 'PROPOSAL', position: 3, isVisible: true },
    { universalIdentifier: '63a44db9-8841-4c03-8458-bd86eb71daaa', fieldValue: 'CUSTOMER', position: 4, isVisible: true },
    { universalIdentifier: '6c9848a4-e7cb-4b6c-90b4-1a2de9083470', fieldValue: 'STEWARDSHIP', position: 5, isVisible: true },
    { universalIdentifier: '6bc3067d-8e99-4405-8efd-74f61f97e334', fieldValue: 'DECLINED', position: 6, isVisible: true },
  ],
});
