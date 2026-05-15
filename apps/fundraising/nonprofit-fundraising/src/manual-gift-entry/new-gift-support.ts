import type { CSSProperties } from 'react';
import type {
  CompanySummary,
  ManualGiftPaymentType,
  OpportunitySummary,
  PersonSummary,
} from './manual-gift-entry.types';
import type { RecurringAgreementSummary } from 'src/recurring/recurring.types';
import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';

export const panelStyle: CSSProperties = {
  padding: '12px 12px 8px',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

export const sectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingBottom: '14px',
  borderBottom: '1px solid #e6e8eb',
};

export const sectionHeaderRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

export const warningSectionStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

export const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: '#57606a',
  lineHeight: 1.5,
};

export const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

export const sectionTitleStyle: CSSProperties = {
  ...labelStyle,
  color: '#1f2328',
};

export const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

export const segmentedControlStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  border: '1px solid #d0d7de',
  borderRadius: '999px',
  background: '#f6f8fa',
  width: 'fit-content',
};

export const segmentedOptionStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '8px 12px',
  background: 'transparent',
  color: '#57606a',
  font: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const selectedSegmentedOptionStyle: CSSProperties = {
  ...segmentedOptionStyle,
  background: '#ffffff',
  color: '#1f2328',
  boxShadow: '0 0 0 1px #d0d7de',
};

export const candidateButtonStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d8dee4',
  borderRadius: '6px',
  padding: '8px 10px',
  textAlign: 'left',
  background: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
};

export const selectedCandidateButtonStyle: CSSProperties = {
  ...candidateButtonStyle,
  border: '1px solid #1f6feb',
  background: '#f7fbff',
};

export const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

export const selectedSummaryStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '8px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  background: '#f6f8fa',
};

export const secondaryChoiceRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '6px',
};

export const inlineMatchSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingTop: '8px',
  borderTop: '1px solid #e6e8eb',
};

export const compactTextActionStyle: CSSProperties = {
  border: 'none',
  padding: 0,
  background: 'transparent',
  color: '#1f6feb',
  font: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
};

export const compactMatchInfoStyle: CSSProperties = {
  display: 'grid',
  gap: '2px',
  minWidth: 0,
};

export const compactMatchActionStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#1f6feb',
  whiteSpace: 'nowrap',
};

export const selectedStateInfoStyle: CSSProperties = {
  display: 'grid',
  gap: '2px',
  minWidth: 0,
};

export const buildPersonDisplayName = (person: PersonSummary) => {
  const firstName = person.name?.firstName?.trim() ?? '';
  const lastName = person.name?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'Unknown donor' : fullName;
};

export const buildCompanyDisplayName = (company: CompanySummary) => {
  const name = company.name?.trim() ?? '';

  return name === '' ? 'Unknown company' : name;
};

export const findSelectedDonor = (
  candidates: PersonSummary[],
  selectedId: string | null,
) => candidates.find((candidate) => candidate.id === selectedId) ?? null;

export const findSelectedCompany = (
  candidates: CompanySummary[],
  selectedId: string | null,
) => candidates.find((candidate) => candidate.id === selectedId) ?? null;

export const buildOpportunityDisplayName = (opportunity: OpportunitySummary) => {
  const opportunityName = opportunity.name?.trim() ?? '';
  const companyName = opportunity.company?.name?.trim() ?? '';

  if (opportunityName === '') {
    return companyName === ''
      ? 'Unnamed opportunity'
      : `Unnamed opportunity · ${companyName}`;
  }

  return companyName === ''
    ? opportunityName
    : `${opportunityName} · ${companyName}`;
};

export const formatAmountMicros = (amountMicros: number, currencyCode: string) =>
  `${currencyCode} ${(amountMicros / 1_000_000).toFixed(2)}`;

export const buildRecurringAgreementDisplayName = (
  agreement: RecurringAgreementSummary,
) => {
  const donorFirstName = agreement.person?.name?.firstName?.trim() ?? '';
  const donorLastName = agreement.person?.name?.lastName?.trim() ?? '';
  const donorName = `${donorFirstName} ${donorLastName}`.trim();

  return donorName === '' ? agreement.name : `${agreement.name} · ${donorName}`;
};

export const normalizeName = (value: string) => value.trim();

export const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'true').toLowerCase() === 'true';

export const PAYMENT_TYPE_OPTIONS: Array<{
  value: ManualGiftPaymentType;
  label: string;
}> = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'DIRECT_DEBIT', label: 'Direct debit' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

export const CURRENCY_OPTIONS = ['GBP', 'USD', 'EUR'];

export const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  return '';
};

export const getInputEventChecked = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'checked' in event.detail
  ) {
    return Boolean(event.detail.checked);
  }

  return false;
};

export const buildMailingAddressInput = (input: {
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressPostcode: string;
  addressCountry: string;
}): MailingAddressEvidence | null => {
  const normalized = {
    ...(input.addressStreet1.trim() !== ''
      ? { addressStreet1: input.addressStreet1.trim() }
      : {}),
    ...(input.addressStreet2.trim() !== ''
      ? { addressStreet2: input.addressStreet2.trim() }
      : {}),
    ...(input.addressCity.trim() !== ''
      ? { addressCity: input.addressCity.trim() }
      : {}),
    ...(input.addressState.trim() !== ''
      ? { addressState: input.addressState.trim() }
      : {}),
    ...(input.addressPostcode.trim() !== ''
      ? { addressPostcode: input.addressPostcode.trim() }
      : {}),
    ...(input.addressCountry.trim() !== ''
      ? { addressCountry: input.addressCountry.trim().toUpperCase() }
      : {}),
  };

  return Object.keys(normalized).length === 0 ? null : normalized;
};
