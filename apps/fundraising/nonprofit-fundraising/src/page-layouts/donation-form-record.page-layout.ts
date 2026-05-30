import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/donation-form-workspace.front-component';
import { DONATION_FORM_PREVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/donation-form-preview.front-component';
import { DONATION_FORM_PUBLISH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/donation-form-publish.front-component';
import { DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/donation-form.object';

export default definePageLayout({
  universalIdentifier: 'e2321e62-bfcc-4dd3-ab63-78151b390d37',
  name: 'Donation Form Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '7b434523-222f-483a-b485-c32e767977d0',
      title: 'Configure',
      position: 0,
      icon: 'IconAdjustmentsHorizontal',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'efe6c726-8431-4ce7-b77e-e67fd3477c17',
          title: 'Donation form configuration',
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
      universalIdentifier: 'f47c2d79-57af-4b8a-879b-8fd567ba2e13',
      title: 'Preview',
      position: 50,
      icon: 'IconBrowserMaximize',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '10329c8d-4178-45d1-82df-5af7dfe1ca42',
          title: 'Donation form preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              DONATION_FORM_PREVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: '8a37fc33-c995-4fa8-a60f-fbf4e9d9735f',
      title: 'Publish',
      position: 75,
      icon: 'IconWorldUpload',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '95b95c57-9ee9-49d0-b17f-2bf94f177774',
          title: 'Donation form publishing',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              DONATION_FORM_PUBLISH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
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
