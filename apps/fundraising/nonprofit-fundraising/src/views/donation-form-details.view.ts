import { defineView } from 'twenty-sdk/define';
import {
  DONATION_FORM_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PROVIDER_CONFIG_KEY_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLIC_ID_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLISHED_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLISHED_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/donation-form.object';

export const DONATION_FORM_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  '0fb72d64-cc75-4d15-95cb-a2987a6d7c24';

export default defineView({
  universalIdentifier: DONATION_FORM_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Donation form details',
  objectUniversalIdentifier: DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: '275d0d71-7aa6-4838-b8f0-64105b6a0cc5',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'ea429d42-a7da-4b0c-8b72-7e6c87f9cc1e',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'b2c467cf-e210-47df-9222-3635bc680c5a',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLIC_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'ecb812a5-775c-45de-9e86-ee2909850491',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '0c73090a-ceb7-4c83-84bc-56df8b38ab7f',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PROVIDER_CONFIG_KEY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '151cfc83-58af-42b5-a2f8-fdd5028b51ea',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLISHED_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '2a7fb290-a1bf-4a15-8ca9-12d29f339afd',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd1d699d5-3c66-4cb6-914f-a1e6d542dd47',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
      position: 7,
      isVisible: true,
      size: 320,
    },
    {
      universalIdentifier: '8f95f0bb-fdca-4e57-bf3d-9479d15f60ab',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLISHED_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
      position: 8,
      isVisible: true,
      size: 320,
    },
  ],
});
