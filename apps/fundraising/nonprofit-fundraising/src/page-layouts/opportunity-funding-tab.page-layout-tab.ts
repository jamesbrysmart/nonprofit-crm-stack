import {
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
  definePageLayoutTab,
} from 'twenty-sdk/define';
import { OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/opportunity-home-core.view';

export default definePageLayoutTab({
  universalIdentifier: 'f42f11c9-3607-4072-a6e0-0f95b47c7452',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.opportunityRecordPage
      .universalIdentifier,
  title: 'Funding',
  position: 5,
  icon: 'IconTargetArrow',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: '31590c2e-4db8-4f9a-9060-a767cf552f28',
      title: 'Funding detail',
      type: 'FIELDS',
      configuration: {
        configurationType: 'FIELDS',
        viewUniversalIdentifier: OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
