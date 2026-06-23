import {
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
  definePageLayoutTab,
} from 'twenty-sdk/define';
import { COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/company-record-summary.front-component';
import { COMPANY_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/company-details.view';

export default definePageLayoutTab({
  universalIdentifier: '05b7cb59-c032-4511-9e0c-688264bfb169',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
      .universalIdentifier,
  title: 'Constituent',
  position: 5,
  icon: 'IconHeartHandshake',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: 'f6e843c1-8430-4732-bb18-64103f789a31',
      title: 'Company constituent context',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: 'a3e7a2ed-8da2-48b3-a0f8-c43cf41d05db',
      title: 'Company details',
      type: 'FIELDS',
      configuration: {
        configurationType: 'FIELDS',
        viewUniversalIdentifier: COMPANY_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: '5a2fc1f1-e98f-49b2-ac65-34b2e2e15750',
      title: 'Opportunities',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.opportunities
            .universalIdentifier,
        fieldDisplayMode: 'FIELD',
      },
    },
    {
      universalIdentifier: 'df13728a-ed08-4a79-946d-3f20340477a7',
      title: 'People',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields.people
            .universalIdentifier,
        fieldDisplayMode: 'FIELD',
      },
    },
  ],
});
