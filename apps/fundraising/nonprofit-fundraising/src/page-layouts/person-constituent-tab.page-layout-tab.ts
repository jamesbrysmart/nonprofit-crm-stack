import {
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
  definePageLayoutTab,
} from 'twenty-sdk/define';
import { FUNDRAISER_APPEAL_SOURCES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fundraiser-appeal-sources-on-person.field';
import { GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-aid-declarations-on-person.field';
import { GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gifts-on-person.field';
import { RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/recurring-agreements-on-person.field';
import { PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/person-record-summary.front-component';
import { PERSON_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/person-details.view';

export default definePageLayoutTab({
  universalIdentifier: '70c80506-2d48-4f7d-9f48-77cde12d7baf',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
      .universalIdentifier,
  title: 'Constituent',
  position: 5,
  icon: 'IconHeartHandshake',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: 'fc7a664a-7d5d-4c2a-95d1-412d3cc9261d',
      title: 'Person constituent context',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: '9fb0b7db-7143-405d-801b-1cc6e5a88d91',
      title: 'Person details',
      type: 'FIELDS',
      configuration: {
        configurationType: 'FIELDS',
        viewUniversalIdentifier: PERSON_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
      },
    },
    {
      universalIdentifier: '3e8345fa-c942-4bd0-a2f6-6cb704ea1210',
      title: 'Gifts',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId: GIFTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'FIELD',
      },
    },
    {
      universalIdentifier: '11f0a29f-ad05-49e9-aea6-ff33026c3bc1',
      title: 'Recurring agreements',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          RECURRING_AGREEMENTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'FIELD',
      },
    },
    {
      universalIdentifier: '60c499f9-37d6-4d0f-9a8e-694a35b96d2b',
      title: 'Gift Aid declarations',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          GIFT_AID_DECLARATIONS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'FIELD',
      },
    },
    {
      universalIdentifier: 'b27868f6-836b-4f1a-9f6f-11db8d4cf784',
      title: 'Fundraiser sources',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          FUNDRAISER_APPEAL_SOURCES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
        fieldDisplayMode: 'FIELD',
      },
    },
    {
      universalIdentifier: 'c7e347dd-40e0-4ab4-a946-c038e383a752',
      title: 'Opportunity contact',
      type: 'FIELD',
      configuration: {
        configurationType: 'FIELD',
        fieldMetadataId:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields
            .pointOfContactForOpportunities.universalIdentifier,
        fieldDisplayMode: 'FIELD',
      },
    },
  ],
});
