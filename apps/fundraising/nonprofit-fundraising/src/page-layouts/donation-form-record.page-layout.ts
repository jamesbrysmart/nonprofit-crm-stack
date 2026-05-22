import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/donation-form-workspace.front-component';
import { DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/donation-form.object';
import { DONATION_FORM_DETAILS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/donation-form-details.view';

export default definePageLayout({
  universalIdentifier: 'e2321e62-bfcc-4dd3-ab63-78151b390d37',
  name: 'Donation Form Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '7b434523-222f-483a-b485-c32e767977d0',
      title: 'Fields',
      position: 0,
      icon: 'IconListDetails',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'efe6c726-8431-4ce7-b77e-e67fd3477c17',
          title: 'Donation form details',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewId: DONATION_FORM_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'f47c2d79-57af-4b8a-879b-8fd567ba2e13',
      title: 'Workspace',
      position: 50,
      icon: 'IconBrowserMaximize',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '10329c8d-4178-45d1-82df-5af7dfe1ca42',
          title: 'Donation form workspace',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'c649fed2-e40f-46bd-b88d-a7ffc1b8ca87',
      title: 'Notes',
      position: 100,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b8cf37fe-8ac4-4363-9a11-b7e787d6451d',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
  ],
});
