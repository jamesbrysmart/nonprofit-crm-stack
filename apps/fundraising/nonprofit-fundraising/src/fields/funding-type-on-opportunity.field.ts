import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const FUNDING_TYPE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '86316054-7f56-47c1-9dd6-6aaae4d6fc18';

export default defineField({
  universalIdentifier: FUNDING_TYPE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'fundingType',
  label: 'Funding type',
  description:
    'Broad fundraising context for the opportunity, such as grant, statutory bid, or sponsorship.',
  icon: 'IconCategory',
  isNullable: true,
  defaultValue: null,
  options: [
    {
      id: '37d36b20-cdc7-4cf9-9bc0-eb5b642960e6',
      value: 'GRANT',
      label: 'Grant',
      position: 0,
      color: 'green',
    },
    {
      id: 'f1d77107-4020-4f11-b1c6-cae50d936096',
      value: 'TRUST_FOUNDATION',
      label: 'Trust/foundation',
      position: 1,
      color: 'blue',
    },
    {
      id: 'e44f1740-1a9a-4c8f-a5a9-b72006bf2a42',
      value: 'STATUTORY_BID',
      label: 'Statutory bid',
      position: 2,
      color: 'purple',
    },
    {
      id: '9a2721d1-cfd8-4924-bf43-c5245708b51f',
      value: 'CORPORATE_SPONSORSHIP',
      label: 'Corporate sponsorship',
      position: 3,
      color: 'orange',
    },
    {
      id: 'd3b20a52-b1dd-4ccd-ba1a-b933b44b2af0',
      value: 'MAJOR_GIFT',
      label: 'Major gift',
      position: 4,
      color: 'yellow',
    },
    {
      id: 'f056fdf4-98f4-4e9d-aea6-918722ed8fa4',
      value: 'OTHER',
      label: 'Other',
      position: 5,
      color: 'gray',
    },
  ],
});
