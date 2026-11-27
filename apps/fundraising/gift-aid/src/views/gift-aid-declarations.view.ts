import { defineView, ViewKey } from 'twenty-sdk/define';
import { GIFT_AID_DECLARATIONS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  GIFT_AID_DECLARATION_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_AID_DECLARATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: GIFT_AID_DECLARATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift Aid declarations',
  objectUniversalIdentifier: GIFT_AID_DECLARATION_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconFileCertificate',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: '0c1e9831-b073-46ec-b048-b9f5a082c0cd',
      fieldMetadataUniversalIdentifier: GIFT_AID_DECLARATION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5d20e49f-cd9e-4b14-8855-0ca43a1b16ac',
      fieldMetadataUniversalIdentifier: PERSON_ON_GIFT_AID_DECLARATION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '56fdeade-7bd4-4b14-a652-d3a22129522c',
      fieldMetadataUniversalIdentifier: GIFT_AID_DECLARATION_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'ac820022-d226-4c4d-8775-b3128074e2fd',
      fieldMetadataUniversalIdentifier: GIFT_AID_DECLARATION_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '5f65e050-db58-43ef-80ca-e0c425ebf91a',
      fieldMetadataUniversalIdentifier: GIFT_AID_DECLARATION_COVERAGE_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 170,
    },
  ],
});
