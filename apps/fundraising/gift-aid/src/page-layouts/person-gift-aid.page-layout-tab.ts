import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: '98d00dea-52d9-455b-bfac-701c0af91232',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.universalIdentifier,
  title: 'Gift Aid',
  icon: 'IconReceiptTax',
  position: 200,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: 'cb39958a-0b7d-46e2-9d09-ba971e471618',
      title: 'Gift Aid declarations',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'TABLE',
      },
    },
  ],
});
