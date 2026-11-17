import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PERSON_NGF_PROFILE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/person-ngf-profile-fields';
import { PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/programme-roles-on-person.field';
import { RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/relationships-on-person.field';
import { REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/reverse-relationships-on-person.field';
import { EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/event-guests-on-person.field';
import { MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/memberships-on-person.field';

export default definePageLayoutTab({
  universalIdentifier: 'e25dbfc1-9c4d-40b4-8dc4-a6617bf6a3c6',
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.universalIdentifier,
  title: "Arts and engagement",
  position: 4,
  icon: 'IconMasksTheater',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
        {
          universalIdentifier: 'e3ed3a2d-67c1-4d77-99fa-d7cdf1ee44c0',
          title: 'Profile and preferences',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: PERSON_NGF_PROFILE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '5fdc0ac8-57e8-4814-ae47-1a15ee8354b6',
          title: "Programme roles",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: PROGRAMME_ROLES_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '65b4b10a-c193-4ffa-85d0-5e3f023eb31f',
          title: "Relationships",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '0acc0c27-a8b6-4be5-a7bc-87324e37cef5',
          title: "Related to",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: REVERSE_RELATIONSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '958b91fa-f353-4ebd-975a-6d25c3f4a642',
          title: "Events attended",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: EVENT_GUESTS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
        {
          universalIdentifier: '8472a046-0c26-4e13-b59a-dfd53a42be31',
          title: "Memberships",
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: MEMBERSHIPS_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
  ],
});
