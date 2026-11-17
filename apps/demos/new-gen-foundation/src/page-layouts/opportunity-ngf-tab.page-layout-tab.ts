import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/scholarship-holders-on-opportunity.field';
import { SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/sponsored-events-on-opportunity.field';

export default definePageLayoutTab({
  universalIdentifier: 'f4750ff2-7ee3-484e-809d-7f6f5513ec38',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage.universalIdentifier,
  title: "Programme",
  position: 4,
  icon: 'IconMasksTheater',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
        {
          universalIdentifier: 'fcd1a042-ad0e-4454-9c9d-a509e85460d5',
          title: "Scholarship holders",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SCHOLARSHIP_HOLDERS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '7da53f84-9b63-4128-86ae-27a4e49bbaf4',
          title: "Sponsored events",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SPONSORED_EVENTS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
  ],
});
