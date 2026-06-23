import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineView,
} from 'twenty-sdk/define';
import { FIRST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/first-gift-date-on-person.field';
import { GIFT_COUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/gift-count-on-person.field';
import { LARGEST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/largest-gift-amount-on-person.field';
import { LAST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/last-gift-amount-on-person.field';
import { LAST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/last-gift-date-on-person.field';
import { LIFETIME_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/lifetime-gift-amount-on-person.field';
import { MAILING_ADDRESS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/mailing-address-on-person.field';
import { SUPPORTER_EMAIL_OPT_OUT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/supporter-email-opt-out-on-person.field';

export const PERSON_DETAILS_VIEW_UNIVERSAL_IDENTIFIER =
  'f36c77df-b0d8-42b4-a4f7-8e42e495d58d';

const CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '82a3a1c2-1e32-4973-a6df-15d768dfc016';
const GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'bb42f4fb-b9ac-47bf-9bbd-67dbb80df00d';
const PREFERENCES_AND_ADMIN_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  'c39a7804-5bb1-4265-a9af-0b8378821fda';

export default defineView({
  universalIdentifier: PERSON_DETAILS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Person details fields',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  icon: 'IconListDetails',
  position: 101,
  fieldGroups: [
    {
      universalIdentifier: CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Contact details',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Giving summary',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: PREFERENCES_AND_ADMIN_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Preferences and admin',
      position: 2,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'aa5fc9e3-6e71-467f-bb91-3f8f8fa1b0c6',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.name
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '30b37ddc-6862-403f-a801-707a7059f420',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.emails
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '4c11be11-7921-4b8c-a359-8e7f1736a48b',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.phones
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'cf9982cd-9068-4561-a391-a3532ee64046',
      fieldMetadataUniversalIdentifier:
        MAILING_ADDRESS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '1ed0f5d9-488d-4beb-b29d-544022d11e6e',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.company
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '1796b33f-a643-4fe9-a0a6-8a2a0f686e35',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.jobTitle
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7d167462-253b-4465-9b02-fac1502d71d0',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields.linkedinLink
          .universalIdentifier,
      viewFieldGroupUniversalIdentifier:
        CONTACT_DETAILS_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: '9f19877b-8f77-4cb5-9477-01fe185154b4',
      fieldMetadataUniversalIdentifier:
        LIFETIME_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '9e742b1f-9aa4-4fc4-bf44-a8e6c0d7768f',
      fieldMetadataUniversalIdentifier:
        GIFT_COUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '00c4b70e-7b87-4376-898e-d31fdac791b0',
      fieldMetadataUniversalIdentifier:
        FIRST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '86399826-3963-4a73-b959-e9835e6f308c',
      fieldMetadataUniversalIdentifier:
        LAST_GIFT_DATE_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'f681d3b1-af23-4a70-b05c-0c4d8f3ad454',
      fieldMetadataUniversalIdentifier:
        LAST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '80be2a72-5929-4c44-aef1-12e6697adf01',
      fieldMetadataUniversalIdentifier:
        LARGEST_GIFT_AMOUNT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIVING_SUMMARY_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '40cd685a-90b8-41a6-8153-af23be0689e7',
      fieldMetadataUniversalIdentifier:
        SUPPORTER_EMAIL_OPT_OUT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        PREFERENCES_AND_ADMIN_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
  ],
});
