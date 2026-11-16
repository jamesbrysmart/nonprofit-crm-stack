import { defineObject, FieldType } from 'twenty-sdk/define';
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
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DONATION_FORM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'donationForm',
  namePlural: 'donationForms',
  labelSingular: 'Donation form',
  labelPlural: 'Donation forms',
  description:
    'Configured public donation forms that charities can publish and embed on their websites.',
  icon: 'IconHeartHandshake',
  labelIdentifierFieldMetadataUniversalIdentifier:
    DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: DONATION_FORM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Internal label for the donation form',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: DONATION_FORM_PUBLIC_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'publicId',
      label: 'Public ID',
      description: 'Stable public identifier used by the embed/runtime layer',
      icon: 'IconLink',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: DONATION_FORM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Publication lifecycle for the donation form',
      icon: 'IconBroadcast',
      defaultValue: "'DRAFT'",
      options: [
        {
          id: '0c658309-e479-4143-b5ec-1e33f4c7805a',
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: 'f5979f55-26e7-4326-a6c2-2c4e53002035',
          value: 'LIVE',
          label: 'Live',
          position: 1,
          color: 'green',
        },
        {
          id: '413b3854-51dc-4b57-aac7-e213dc6ab7c0',
          value: 'ARCHIVED',
          label: 'Archived',
          position: 2,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier:
        DONATION_FORM_PAYMENT_PROVIDER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'paymentProvider',
      label: 'Payment provider',
      description: 'Provider used to collect donations for this form',
      icon: 'IconCreditCard',
      defaultValue: "'STRIPE'",
      options: [
        {
          id: '0b0ce0ae-877b-4ab8-a492-91d2ff04fc8f',
          value: 'STRIPE',
          label: 'Stripe',
          position: 0,
          color: 'blue',
        },
      ],
    },
    {
      universalIdentifier:
        DONATION_FORM_PROVIDER_CONFIG_KEY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'providerConfigKey',
      label: 'Provider config key',
      description:
        'Workspace/provider reference used to resolve the server-side payment configuration',
      icon: 'IconKey',
      isNullable: true,
      defaultValue: "'stripe-default'",
    },
    {
      universalIdentifier: DONATION_FORM_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'config',
      label: 'Config',
      description: 'Draft runtime configuration for the donation form',
      icon: 'IconBraces',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        DONATION_FORM_PUBLISHED_CONFIG_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'publishedConfig',
      label: 'Published config',
      description:
        'Last published public-safe configuration snapshot served to the public runtime',
      icon: 'IconFileExport',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        DONATION_FORM_PUBLISHED_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'publishedVersion',
      label: 'Published version',
      description:
        'Stable published configuration version used to correlate runtime activity and intake',
      icon: 'IconVersions',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: DONATION_FORM_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'publishedAt',
      label: 'Published at',
      description: 'Timestamp of the most recent publish action',
      icon: 'IconClock',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
