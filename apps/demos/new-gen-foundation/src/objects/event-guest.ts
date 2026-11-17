import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '80f8aa74-e6a4-43df-88b4-27d89a7449d4';

export default defineObject({
  universalIdentifier: 'eb48cdff-bffd-4eda-9e9b-b85ad8e6ded2',
  nameSingular: 'eventGuest',
  namePlural: 'eventGuests',
  labelSingular: 'Event Guest',
  labelPlural: 'Event Guests',
  description: "A person invited to an event, with RSVP and attendance",
  icon: 'IconTicket',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'a9963296-ed50-488b-92a5-23f82750e8d2',
      type: FieldType.SELECT,
      name: 'rsvpStatus',
      label: "RSVP",
      icon: 'IconMailOpened',
      options: [
        { value: 'INVITED', label: "Invited", position: 0, color: 'gray' },
        { value: 'ACCEPTED', label: "Accepted", position: 1, color: 'green' },
        { value: 'DECLINED', label: "Declined", position: 2, color: 'red' },
        { value: 'ATTENDED', label: "Attended", position: 3, color: 'blue' },
        { value: 'NO_SHOW', label: "No-show", position: 4, color: 'orange' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: '37f13c26-86f4-4113-91f3-3a40d6c2fe2b',
      type: FieldType.SELECT,
      name: 'guestRole',
      label: "Guest role",
      icon: 'IconUserStar',
      options: [
        { value: 'GUEST', label: "Guest", position: 0, color: 'gray' },
        { value: 'HOST', label: "Table host", position: 1, color: 'purple' },
        { value: 'PERFORMER', label: "Performer", position: 2, color: 'pink' },
        { value: 'SPONSOR', label: "Sponsor", position: 3, color: 'yellow' },
        { value: 'PROSPECT', label: "Prospect", position: 4, color: 'sky' },
        { value: 'STAFF', label: "Staff", position: 5, color: 'turquoise' },
        { value: 'PRESS', label: "Press", position: 6, color: 'orange' },
      ],
      isNullable: true,
    },
    {
      universalIdentifier: 'f5cc1672-9606-4688-b471-731b3cb7c9ce',
      type: FieldType.NUMBER,
      name: 'partySize',
      label: "Party size",
      icon: 'IconUsers',
      isNullable: true,
    },
    {
      universalIdentifier: '432f5bf1-5fb3-4e2e-a067-e441217ae294',
      type: FieldType.TEXT,
      name: 'tableName',
      label: "Table",
      icon: 'IconArmchair',
      isNullable: true,
    },
    {
      universalIdentifier: 'e2fb5162-fd6b-486b-bc2b-4ebd596e21f5',
      type: FieldType.TEXT,
      name: 'notes',
      label: "Guest notes",
      icon: 'IconNotes',
      description: "Dietary, access and seating notes",
      isNullable: true,
    },
    {
      universalIdentifier: '80dd6069-402e-465f-986d-7a3a2a6bdebc',
      type: FieldType.BOOLEAN,
      name: 'followUpDone',
      label: "Follow-up done",
      icon: 'IconChecklist',
    },
  ],
});
