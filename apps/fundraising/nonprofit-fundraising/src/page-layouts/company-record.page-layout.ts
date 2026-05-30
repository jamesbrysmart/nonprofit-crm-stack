import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/company-record-summary.front-component';

export default definePageLayout({
  universalIdentifier: 'bef4ceda-31dd-416c-9e14-cdbbaed4f2b0',
  name: 'Company Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  tabs: [
    {
      universalIdentifier: 'e7ac9db1-a813-42f9-8cc3-1237782837c7',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'c711c30c-e15b-48ff-866e-5eab76264c0c',
          title: 'Company summary',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '2689b51e-6a0a-4657-b32d-6514f72d77ba',
      title: 'Details',
      position: 100,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'cb0ec4ee-0266-4a96-8b2a-a0ed26d7e76b',
          title: 'Company details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '584cb962-4fc0-4d7f-a4a3-ed3ab79f6297',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'de1d3f9f-6258-4c80-b707-cd5d5034ef36',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'e2a2f620-1d0a-4d27-a1cf-a47f02267501',
      title: 'Tasks',
      position: 300,
      icon: 'IconCheckbox',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '2e8c7702-f6b5-491d-a20e-d43f78b43411',
          title: 'Tasks',
          type: 'TASKS',
          configuration: {
            configurationType: 'TASKS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'a7d92fed-ae27-4d61-9320-db347d9d2f39',
      title: 'Notes',
      position: 400,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '7c378162-af48-46db-a7a7-a2e7b0cde74a',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
    {
      universalIdentifier: 'c6432432-eaf4-4953-b8b2-05d8575d4ea6',
      title: 'Files',
      position: 500,
      icon: 'IconPaperclip',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '7c4e4c79-b06f-4bc8-820e-68fec817d331',
          title: 'Files',
          type: 'FILES',
          configuration: {
            configurationType: 'FILES',
          },
        },
      ],
    },
  ],
});
