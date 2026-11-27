import { GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import {
  FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/fundraising-core';

export default defineField({
  universalIdentifier: '4b740c21-6037-4fd6-9df4-63b571c2d831',
  name: 'capturedGiftAidDeclarations',
  label: 'Captured Gift Aid declarations',
  type: FieldType.RELATION,
  objectUniversalIdentifier: FUNDRAISING_GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetObjectMetadataUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: 'ca5cbfbe-f2bd-418b-b8c8-140f6be24644',
  isUIEditable: false,
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
