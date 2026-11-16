import type { CSSProperties } from 'react';
import { theme } from 'src/front-components/theme-tokens';
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
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  minWidth: 0,
};

export const sectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingBottom: '14px',
  borderBottom: `1px solid ${theme.border.color.light}`,
  minWidth: 0,
  width: '100%',
  boxSizing: 'border-box',
};

export const sectionHeaderRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

export const warningSectionStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '10px',
  background: theme.background.primary,
  minWidth: 0,
  boxSizing: 'border-box',
};

export const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: theme.font.color.secondary,
  lineHeight: 1.5,
};

export const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.font.color.secondary,
};

export const sectionTitleStyle: CSSProperties = {
  ...labelStyle,
  color: theme.font.color.primary,
};

export const inputStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: theme.background.primary,
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

export const fieldStyle: CSSProperties = {
  display: 'grid',
  gap: '6px',
  minWidth: 0,
};

export const fieldGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  alignItems: 'start',
  minWidth: 0,
  width: '100%',
};

export const fieldActionGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'end',
  minWidth: 0,
  width: '100%',
};

export const checkboxLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: theme.font.color.primary,
};

export const stackedSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

export const segmentedControlStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '999px',
  background: theme.background.secondary,
  width: 'fit-content',
};

export const segmentedOptionStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '8px 12px',
  background: 'transparent',
  color: theme.font.color.secondary,
  font: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const selectedSegmentedOptionStyle: CSSProperties = {
  ...segmentedOptionStyle,
  background: theme.background.primary,
  color: theme.font.color.primary,
  boxShadow: `0 0 0 1px ${theme.border.color.medium}`,
};

export const candidateButtonStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '8px 10px',
  textAlign: 'left',
  background: theme.background.primary,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
};

export const selectedCandidateButtonStyle: CSSProperties = {
  ...candidateButtonStyle,
  border: `1px solid ${theme.color.blue}`,
  background: theme.color.blue3,
};

export const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.font.color.secondary,
  lineHeight: 1.5,
};

export const selectedSummaryStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '8px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  background: theme.background.secondary,
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
  borderTop: `1px solid ${theme.border.color.light}`,
};

export const compactTextActionStyle: CSSProperties = {
  border: 'none',
  padding: 0,
  background: 'transparent',
  color: theme.color.blue,
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
  color: theme.color.blue,
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

export const findPrimaryEmailCandidate = (
  candidates: PersonSummary[],
  email: string,
) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === '') {
    return null;
  }

  return (
    candidates.find(
      (candidate) =>
        candidate.emails?.primaryEmail?.trim().toLowerCase() === normalizedEmail,
    ) ?? null
  );
};

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
