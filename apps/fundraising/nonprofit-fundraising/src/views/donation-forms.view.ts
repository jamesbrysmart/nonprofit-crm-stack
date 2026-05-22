import { defineView, ViewKey } from 'twenty-sdk/define';
import {
  DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PROVIDER_CONFIG_KEY_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLIC_ID_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_PUBLISHED_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  DONATION_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/donation-form.object';

export const DONATION_FORMS_VIEW_UNIVERSAL_IDENTIFIER =
  '63fb675b-aa75-43d4-8247-f5aef7a44b8d';

export default defineView({
  universalIdentifier: DONATION_FORMS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Donation forms',
  objectUniversalIdentifier: DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHeartHandshake',
  key: ViewKey.INDEX,
  position: 1,
  fields: [
    {
      universalIdentifier: '11d14432-bdbd-4d47-b0bc-087fd1abd268',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'ae4f92b6-a9aa-4229-a79e-a877d628ca41',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'e934552a-c569-40ce-8600-2ebd54f2fb2b',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLIC_ID_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'fae01e17-252f-4b02-a399-53f5dcf3d629',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLISHED_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '53d2e6e4-9d37-43c0-8ea4-9db64b2d2849',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '6a3552ba-e545-4431-bd66-c7bff9a5f87a',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PROVIDER_CONFIG_KEY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '66c53d77-6e48-4ff4-bb6d-42b8a85df0cd',
      fieldMetadataUniversalIdentifier:
        DONATION_FORM_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
});
