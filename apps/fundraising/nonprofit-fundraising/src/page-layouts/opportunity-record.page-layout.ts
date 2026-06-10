import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/opportunity-home-core.view';

export default definePageLayout({
  universalIdentifier: '44eb8b3e-b850-4288-b35d-6e7f5a7bd88d',
  name: 'Opportunity Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  tabs: [
    {
      universalIdentifier: '21226a80-2f39-47b0-8773-ab4d711e7261',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '5ce47e66-f59f-44a4-8f1f-a8e5ec481728',
          title: 'Funding summary',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: OPPORTUNITY_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '80bb8c76-b0b6-4fc6-91dd-c1e9ddf0f3ae',
          title: 'Point of Contact',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.pointOfContact
                .universalIdentifier,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '3282f0f4-2f35-44e6-a684-c545e271afab',
          title: 'Company',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.company
                .universalIdentifier,
            fieldDisplayMode: 'FIELD',
          },
        },
        {
          universalIdentifier: '852a9179-4075-4e79-aa0a-f4419fc9eb13',
          title: 'Owner',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.owner
                .universalIdentifier,
            fieldDisplayMode: 'FIELD',
          },
        },
      ],
    },
    {
      universalIdentifier: 'b7985114-0ca5-415a-9300-babfb9ca5d71',
      title: 'Details',
      position: 100,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '4b8223be-d99d-4564-aec3-ff9d4bbd4bc4',
          title: 'Opportunity details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '7376b5fb-8c09-40d1-a006-2c8cd449c28e',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'f5201ff2-d240-4fe9-b4dd-c1a8236e5e33',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: '937238a0-1641-4c7d-bfc4-310584581dcf',
      title: 'Tasks',
      position: 300,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'c32cb344-b6d9-44e6-a0a0-9f9c2cbd0baf',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'b9a4ba1b-5714-4ee8-9e76-af56f2e86f05',
      title: 'Notes',
      position: 400,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'e42578f8-5438-4275-bf6d-a07c5fe2af9f',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier: '8c151b3a-991f-46cc-8040-3572d3f79222',
      title: 'Files',
      position: 500,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '58f59e3d-2126-4fb2-9425-e33f676fe1fd',
          title: 'Files',
          type: 'FILES',
          configuration: {
            configurationType: 'FILES',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c464d52b-f4f6-4e75-85b1-8d1fd424f37b',
      title: 'Emails',
      position: 600,
      icon: 'IconMail',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'efd5daf4-e34d-4f8a-ae85-280579228027',
          title: 'Emails',
          type: 'EMAILS',
          configuration: {
            configurationType: 'EMAILS',
          },
        },
      ],
    },
    {
      universalIdentifier: '41f5555f-3217-4652-80ae-120486a86e9a',
      title: 'Calendar',
      position: 700,
      icon: 'IconCalendar',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '85d4d972-21fe-4c68-ac25-4d4eef851e38',
          title: 'Calendar',
          type: 'CALENDAR',
          configuration: {
            configurationType: 'CALENDAR',
          },
        },
      ],
    },
  ],
});
