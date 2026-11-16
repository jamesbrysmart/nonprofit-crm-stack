import { defineView } from 'twenty-sdk/define';
import {
  FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '9f8a0315-6b8a-4c69-8976-c69e64040cec';
const FUND_DETAILS_FINANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '7dba9d2a-40da-4d8f-91f4-b5dc471839c6';
const FUND_DETAILS_DESCRIPTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '55b174f9-3ad0-4c89-91bf-c1829d73451a';

export default defineView({
  universalIdentifier: FUND_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Fund details fields',
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Fund',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: FUND_DETAILS_FINANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Finance',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier:
        FUND_DETAILS_DESCRIPTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Description',
      position: 2,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '5cc5c637-2467-4376-a095-029854c6f3c2',
      fieldMetadataUniversalIdentifier: FUND_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '3e12fb7e-823c-4f3e-918d-7f72c33f2f8e',
      fieldMetadataUniversalIdentifier: FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '559f0901-c6c9-411f-a1e8-d77d2bff9ab4',
      fieldMetadataUniversalIdentifier:
        FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '33d98b2b-5303-42ff-934b-7cc7362b75a9',
      fieldMetadataUniversalIdentifier: FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_FUND_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '7fb35875-2ff3-4307-adf3-cd7f9b90b81e',
      fieldMetadataUniversalIdentifier:
        FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_FINANCE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '03c3a0de-a47b-40d7-9dc4-65670a311f36',
      fieldMetadataUniversalIdentifier:
        FUND_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_DETAILS_DESCRIPTION_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 320,
    },
  ],
});
