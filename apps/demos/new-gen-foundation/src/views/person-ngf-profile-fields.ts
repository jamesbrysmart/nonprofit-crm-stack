import { defineView, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const PERSON_NGF_PROFILE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  '97176d62-ec7b-41a2-ab43-18ca592e7ada';

export default defineView({
  universalIdentifier: PERSON_NGF_PROFILE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'person-ngf-profile-fields',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: 'FIELDS_WIDGET',
  icon: 'IconListDetails',
  position: 0,
  fields: [
    {
      universalIdentifier: '22a22a31-22bd-4e60-9dce-e3d50d65e7b6',
      fieldMetadataUniversalIdentifier: 'eb85c6aa-4e7d-497a-ba3d-e31fa04067d8',
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'bf2dd9f9-3697-4caf-b72b-dfb31e7b1b17',
      fieldMetadataUniversalIdentifier: 'ee5bc63f-cd8f-4793-95bc-165fcc30af7c',
      position: 1,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f0886667-d9e7-44b6-8c1f-c486455809c3',
      fieldMetadataUniversalIdentifier: 'cab5fc6f-ee17-4b7f-aa28-2f484348cf39',
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '89dee932-674b-48a7-bb29-fda6ef4038e3',
      fieldMetadataUniversalIdentifier: 'c6ab9c22-2d8f-4238-9788-ddf561ebc19f',
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '27471f9c-7982-4f59-9ee0-a36ac5744474',
      fieldMetadataUniversalIdentifier: 'd2101b1b-cb23-45fa-b657-883dc6f7804e',
      position: 4,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3e59331c-5a6b-4aa2-ad34-de2075d60c24',
      fieldMetadataUniversalIdentifier: '9f8bbadf-e989-4b66-976f-496353a1468d',
      position: 5,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '7c4889a5-b7dd-4120-8349-4114ae3cc87a',
      fieldMetadataUniversalIdentifier: '73d7f587-42d2-4be7-bcb0-acdade2f8952',
      position: 6,
      isVisible: true,
      size: 160,
    },
  ],
});
