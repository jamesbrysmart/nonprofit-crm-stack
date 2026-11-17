import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/people-relationships-on-company.field';
import { HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/hosted-events-on-company.field';

export default definePageLayoutTab({
  universalIdentifier: 'c01a0952-911e-4e7c-9c94-23b3502d4c14',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.universalIdentifier,
  title: "NGF",
  position: 4,
  icon: 'IconMasksTheater',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
        {
          universalIdentifier: '28fdc333-3373-4149-9126-2bf019e9bd03',
          title: "People relationships",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: PEOPLE_RELATIONSHIPS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '12c080c6-b8c8-4c6a-9620-255fe0599e5b',
          title: "Events hosted",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: HOSTED_EVENTS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
  ],
});
