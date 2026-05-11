import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { closeSidePanel, enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  checkCompanyDuplicates,
  checkDonorDuplicates,
  checkManualGiftDuplicates,
  createManualGift,
  searchOpportunities,
  searchRecurringAgreements,
} from 'src/manual-gift-entry/manual-gift-entry.api';
import { ManualGiftEntryGiftAidSection } from 'src/manual-gift-entry/manual-gift-entry-gift-aid-capture';
import type {
  CompanyDuplicateCheckResponse,
  CompanySummary,
  DuplicateCheckResponse,
  ManualGiftDuplicateCheckResponse,
  ManualGiftDuplicateMatch,
  ManualGiftCompanyChoice,
  ManualGiftDonorType,
  ManualGiftDonorChoice,
  ManualGiftPaymentType,
  OpportunitySummary,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type { RecurringAgreementSummary } from 'src/recurring/recurring.types';
import type { MailingAddressEvidence } from 'src/gift-aid/gift-aid.types';

export const NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c813555c-eec2-42df-a29b-cd8817e0f4d6';

const NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER =
  'ef13b0da-7934-47cf-b09b-57a67695756d';

const panelStyle: CSSProperties = {
  padding: '12px 12px 8px',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const sectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingBottom: '14px',
  borderBottom: '1px solid #e6e8eb',
};

const sectionHeaderRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const warningSectionStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: '#57606a',
  lineHeight: 1.5,
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const sectionTitleStyle: CSSProperties = {
  ...labelStyle,
  color: '#1f2328',
};

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

const segmentedControlStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  border: '1px solid #d0d7de',
  borderRadius: '999px',
  background: '#f6f8fa',
  width: 'fit-content',
};

const segmentedOptionStyle: CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  padding: '8px 12px',
  background: 'transparent',
  color: '#57606a',
  font: 'inherit',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const selectedSegmentedOptionStyle: CSSProperties = {
  ...segmentedOptionStyle,
  background: '#ffffff',
  color: '#1f2328',
  boxShadow: '0 0 0 1px #d0d7de',
};

const candidateButtonStyle: CSSProperties = {
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

const selectedCandidateButtonStyle: CSSProperties = {
  ...candidateButtonStyle,
  border: '1px solid #1f6feb',
  background: '#f7fbff',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const selectedSummaryStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '8px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  background: '#f6f8fa',
};

const secondaryChoiceRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '6px',
};

const inlineMatchSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  paddingTop: '8px',
  borderTop: '1px solid #e6e8eb',
};

const compactTextActionStyle: CSSProperties = {
  border: 'none',
  padding: 0,
  background: 'transparent',
  color: '#1f6feb',
  font: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
};

const compactMatchInfoStyle: CSSProperties = {
  display: 'grid',
  gap: '2px',
  minWidth: 0,
};

const compactMatchActionStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#1f6feb',
  whiteSpace: 'nowrap',
};

const selectedStateInfoStyle: CSSProperties = {
  display: 'grid',
  gap: '2px',
  minWidth: 0,
};

const buildPersonDisplayName = (person: PersonSummary) => {
  const firstName = person.name?.firstName?.trim() ?? '';
  const lastName = person.name?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'Unknown donor' : fullName;
};

const buildCompanyDisplayName = (company: CompanySummary) => {
  const name = company.name?.trim() ?? '';

  return name === '' ? 'Unknown company' : name;
};

const findSelectedDonor = (
  candidates: PersonSummary[],
  selectedId: string | null,
) => candidates.find((candidate) => candidate.id === selectedId) ?? null;

const findSelectedCompany = (
  candidates: CompanySummary[],
  selectedId: string | null,
) => candidates.find((candidate) => candidate.id === selectedId) ?? null;

const buildOpportunityDisplayName = (opportunity: OpportunitySummary) => {
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

const formatAmountMicros = (amountMicros: number, currencyCode: string) =>
  `${currencyCode} ${(amountMicros / 1_000_000).toFixed(2)}`;

const buildRecurringAgreementDisplayName = (
  agreement: RecurringAgreementSummary,
) => {
  const donorFirstName = agreement.person?.name?.firstName?.trim() ?? '';
  const donorLastName = agreement.person?.name?.lastName?.trim() ?? '';
  const donorName = `${donorFirstName} ${donorLastName}`.trim();

  return donorName === '' ? agreement.name : `${agreement.name} · ${donorName}`;
};

const normalizeName = (value: string) => value.trim();
const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'true').toLowerCase() === 'true';

const PAYMENT_TYPE_OPTIONS: Array<{
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

const CURRENCY_OPTIONS = ['GBP', 'USD', 'EUR'];

const getInputEventValue = (event: unknown) => {
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

const getInputEventChecked = (event: unknown) => {
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

const buildMailingAddressInput = (input: {
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

const NewGift = () => {
  const [donorType, setDonorType] =
    useState<ManualGiftDonorType>('INDIVIDUAL');
  const [donorFirstName, setDonorFirstName] = useState('');
  const [donorLastName, setDonorLastName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [currencyCode, setCurrencyCode] = useState('GBP');
  const [paymentType, setPaymentType] =
    useState<ManualGiftPaymentType>('BANK_TRANSFER');
  const [giftDate, setGiftDate] = useState('');
  const [appealName, setAppealName] = useState('');
  const [includeDonorAddress, setIncludeDonorAddress] = useState(false);
  const [addressStreet1, setAddressStreet1] = useState('');
  const [addressStreet2, setAddressStreet2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressPostcode, setAddressPostcode] = useState('');
  const [addressCountry, setAddressCountry] = useState('GB');
  const [giftAidRequested, setGiftAidRequested] = useState(false);
  const [giftAidDeclarationCaptured, setGiftAidDeclarationCaptured] =
    useState(false);
  const [giftAidDeclarationDate, setGiftAidDeclarationDate] = useState('');
  const [giftAidCoverageScope, setGiftAidCoverageScope] = useState('');
  const [giftAidDeclarationSource, setGiftAidDeclarationSource] = useState('');
  const [giftAidTextVersion, setGiftAidTextVersion] = useState('');
  const [linkRecurringAgreement, setLinkRecurringAgreement] = useState(false);
  const [recurringSearchQuery, setRecurringSearchQuery] = useState('');
  const [recurringResults, setRecurringResults] = useState<
    RecurringAgreementSummary[]
  >([]);
  const [selectedRecurringAgreementId, setSelectedRecurringAgreementId] =
    useState<string | null>(null);
  const [searchingRecurring, setSearchingRecurring] = useState(false);
  const [duplicateResult, setDuplicateResult] =
    useState<DuplicateCheckResponse | null>(null);
  const [donorChoice, setDonorChoice] =
    useState<ManualGiftDonorChoice | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [companyDuplicateResult, setCompanyDuplicateResult] =
    useState<CompanyDuplicateCheckResponse | null>(null);
  const [companyChoice, setCompanyChoice] =
    useState<ManualGiftCompanyChoice | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [linkOpportunity, setLinkOpportunity] = useState(false);
  const [opportunitySearchQuery, setOpportunitySearchQuery] = useState('');
  const [opportunityResults, setOpportunityResults] = useState<
    OpportunitySummary[]
  >([]);
  const [selectedOpportunityId, setSelectedOpportunityId] =
    useState<string | null>(null);
  const [searchingOpportunities, setSearchingOpportunities] = useState(false);
  const [duplicateGiftCheckResult, setDuplicateGiftCheckResult] =
    useState<ManualGiftDuplicateCheckResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDuplicateResult(null);
    setDonorChoice(null);
    setSelectedDonorId(null);
    setCompanyDuplicateResult(null);
    setCompanyChoice(null);
    setSelectedCompanyId(null);
  }, [donorType]);

  useEffect(() => {
    if (donorType !== 'COMPANY') {
      setLinkOpportunity(false);
      setOpportunitySearchQuery('');
      setOpportunityResults([]);
      setSelectedOpportunityId(null);
    }
  }, [donorType]);

  useEffect(() => {
    setDuplicateGiftCheckResult(null);
  }, [
    donorType,
    amountValue,
    currencyCode,
    giftDate,
    donorChoice,
    selectedDonorId,
    companyChoice,
    selectedCompanyId,
  ]);

  const trimmedFirstName = normalizeName(donorFirstName);
  const trimmedLastName = normalizeName(donorLastName);
  const trimmedCompanyName = normalizeName(companyName);
  const canCheckDonorDuplicates =
    donorType === 'INDIVIDUAL' &&
    trimmedFirstName.length >= 2 &&
    trimmedLastName.length >= 2;
  const canCheckCompanyDuplicates =
    donorType === 'COMPANY' && trimmedCompanyName.length >= 2;
  const canSearchRecurring = recurringSearchQuery.trim().length >= 2;
  const canSearchOpportunities = opportunitySearchQuery.trim().length >= 2;

  const duplicateInterruptionVisible = useMemo(
    () => duplicateResult !== null && duplicateResult.status !== 'NO_MATCH',
    [duplicateResult],
  );
  const companyDuplicateInterruptionVisible = useMemo(
    () =>
      companyDuplicateResult !== null &&
      companyDuplicateResult.status !== 'NO_MATCH',
    [companyDuplicateResult],
  );
  const duplicateGiftWarningVisible =
    (duplicateGiftCheckResult?.matches.length ?? 0) > 0;
  const selectedDonorSummary = duplicateResult
    ? findSelectedDonor(duplicateResult.candidates, selectedDonorId)
    : null;
  const selectedCompanySummary = companyDuplicateResult
    ? findSelectedCompany(
        companyDuplicateResult.candidates,
        selectedCompanyId,
      )
    : null;

  const runDonorDuplicateCheck = async () => {
    if (!canCheckDonorDuplicates) {
      throw new Error('Enter donor first name and last name first');
    }

    const result = await checkDonorDuplicates({
      donorFirstName: trimmedFirstName,
      donorLastName: trimmedLastName,
    });

    setDuplicateResult(result);

    return result;
  };

  const runCompanyDuplicateCheck = async () => {
    if (!canCheckCompanyDuplicates) {
      throw new Error('Enter company name first');
    }

    const result = await checkCompanyDuplicates({
      companyName: trimmedCompanyName,
    });

    setCompanyDuplicateResult(result);

    return result;
  };

  useEffect(() => {
    if (donorType !== 'INDIVIDUAL') {
      return;
    }

    if (!canCheckDonorDuplicates) {
      setDuplicateResult(null);
      setDonorChoice(null);
      setSelectedDonorId(null);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      void runDonorDuplicateCheck().catch(() => {
        if (!cancelled) {
          setDuplicateResult(null);
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    donorType,
    canCheckDonorDuplicates,
    trimmedFirstName,
    trimmedLastName,
  ]);

  useEffect(() => {
    if (donorType !== 'COMPANY') {
      return;
    }

    if (!canCheckCompanyDuplicates) {
      setCompanyDuplicateResult(null);
      setCompanyChoice(null);
      setSelectedCompanyId(null);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      void runCompanyDuplicateCheck().catch(() => {
        if (!cancelled) {
          setCompanyDuplicateResult(null);
        }
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [donorType, canCheckCompanyDuplicates, trimmedCompanyName]);

  const handleSubmit = async (ignoreDuplicateWarning = false) => {
    if (
      amountValue.trim() === '' ||
      giftDate.trim() === '' ||
      (donorType === 'INDIVIDUAL'
        ? trimmedFirstName === '' || trimmedLastName === ''
        : trimmedCompanyName === '')
    ) {
      await enqueueSnackbar({
        message:
          donorType === 'INDIVIDUAL'
            ? 'Enter donor first name, donor last name, amount, and gift date.'
            : 'Enter company name, amount, and gift date.',
        variant: 'warning',
      });
      return;
    }

    if (linkRecurringAgreement && !selectedRecurringAgreementId) {
      await enqueueSnackbar({
        message: 'Select the recurring agreement to link before saving.',
        variant: 'warning',
      });
      return;
    }

    let activeDuplicateResult = duplicateResult;
    let activeCompanyDuplicateResult = companyDuplicateResult;

    try {
      if (donorType === 'INDIVIDUAL' && !activeDuplicateResult) {
        activeDuplicateResult = await runDonorDuplicateCheck();
      }

      if (donorType === 'COMPANY' && !activeCompanyDuplicateResult) {
        activeCompanyDuplicateResult = await runCompanyDuplicateCheck();
      }

      if (
        donorType === 'INDIVIDUAL' &&
        activeDuplicateResult &&
        activeDuplicateResult.status !== 'NO_MATCH'
      ) {
        if (donorChoice === null) {
          await enqueueSnackbar({
            message:
              'Choose a matching donor or continue with a new donor before saving.',
            variant: 'warning',
          });
          return;
        }

        if (donorChoice === 'USE_EXISTING' && !selectedDonorId) {
          await enqueueSnackbar({
            message: 'Select the donor to use before saving.',
            variant: 'warning',
          });
          return;
        }
      }

      if (
        donorType === 'COMPANY' &&
        activeCompanyDuplicateResult &&
        activeCompanyDuplicateResult.status !== 'NO_MATCH'
      ) {
        if (companyChoice === null) {
          await enqueueSnackbar({
            message:
              'Choose a matching company or continue with a new company before saving.',
            variant: 'warning',
          });
          return;
        }

        if (companyChoice === 'USE_EXISTING' && !selectedCompanyId) {
          await enqueueSnackbar({
            message: 'Select the company to use before saving.',
            variant: 'warning',
          });
          return;
        }
      }

      const resolvedDonorChoice: ManualGiftDonorChoice =
        donorType === 'INDIVIDUAL' &&
        activeDuplicateResult?.status === 'NO_MATCH'
          ? 'CREATE_NEW'
          : (donorChoice ?? 'CREATE_NEW');
      const resolvedCompanyChoice: ManualGiftCompanyChoice =
        donorType === 'COMPANY' &&
        activeCompanyDuplicateResult?.status === 'NO_MATCH'
          ? 'CREATE_NEW'
          : (companyChoice ?? 'CREATE_NEW');

      const duplicateTarget =
        donorType === 'INDIVIDUAL' &&
        resolvedDonorChoice === 'USE_EXISTING' &&
        selectedDonorId
          ? {
              donorType,
              selectedDonorId,
            }
          : donorType === 'COMPANY' &&
              resolvedCompanyChoice === 'USE_EXISTING' &&
              selectedCompanyId
            ? {
                donorType,
                selectedCompanyId,
              }
            : null;

      if (duplicateTarget) {
        const duplicateGiftResult = await runManualGiftDuplicateCheck(
          duplicateTarget,
        );

        if (duplicateGiftResult.matches.length > 0 && !ignoreDuplicateWarning) {
          await enqueueSnackbar({
            message:
              'A gift with the same donor or company, amount, and date is already on the system or waiting to be processed. Review the matches before continuing.',
            variant: 'warning',
          });
          return;
        }
      } else {
        setDuplicateGiftCheckResult(null);
      }

      setSubmitting(true);

      await createManualGift({
        donorType,
        ...(donorType === 'INDIVIDUAL'
          ? {
              donorFirstName: trimmedFirstName,
              donorLastName: trimmedLastName,
              donorEmail: donorEmail.trim(),
              donorMailingAddress: includeDonorAddress
                ? buildMailingAddressInput({
                    addressStreet1,
                    addressStreet2,
                    addressCity,
                    addressState,
                    addressPostcode,
                    addressCountry,
                  })
                : null,
            }
          : {
              companyName: trimmedCompanyName,
            }),
        amountValue: amountValue.trim(),
        currencyCode,
        paymentType,
        giftDate: giftDate.trim(),
        ...(appealName.trim() !== '' ? { appealName: appealName.trim() } : {}),
        ...(donorType === 'INDIVIDUAL'
          ? {
              giftAidRequested,
              giftAidDeclarationCaptured,
            }
          : {}),
        ...(donorType === 'INDIVIDUAL' && giftAidDeclarationDate.trim() !== ''
          ? { giftAidDeclarationDate: giftAidDeclarationDate.trim() }
          : {}),
        ...(donorType === 'INDIVIDUAL' && giftAidCoverageScope.trim() !== ''
          ? { giftAidCoverageScope: giftAidCoverageScope.trim() }
          : {}),
        ...(donorType === 'INDIVIDUAL' &&
        giftAidDeclarationSource.trim() !== ''
          ? { giftAidDeclarationSource: giftAidDeclarationSource.trim() }
          : {}),
        ...(donorType === 'INDIVIDUAL' && giftAidTextVersion.trim() !== ''
          ? { giftAidTextVersion: giftAidTextVersion.trim() }
          : {}),
        ...(donorType === 'INDIVIDUAL'
          ? {
              donorChoice: resolvedDonorChoice,
            }
          : {
              companyChoice: resolvedCompanyChoice,
            }),
        ...(donorType === 'INDIVIDUAL' &&
        resolvedDonorChoice === 'USE_EXISTING' &&
        selectedDonorId
          ? { selectedDonorId }
          : {}),
        ...(donorType === 'COMPANY' &&
        resolvedCompanyChoice === 'USE_EXISTING' &&
        selectedCompanyId
          ? { selectedCompanyId }
          : {}),
        ...(donorType === 'COMPANY' &&
        linkOpportunity &&
        selectedOpportunityId
          ? { selectedOpportunityId }
          : {}),
        ...(linkRecurringAgreement && selectedRecurringAgreementId
          ? { selectedRecurringAgreementId }
          : {}),
      });

      await enqueueSnackbar({
        message: 'Gift created successfully.',
        variant: 'success',
      });
      await closeSidePanel();
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to create gift.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchRecurringAgreements = async () => {
    if (!canSearchRecurring) {
      await enqueueSnackbar({
        message: 'Enter at least two characters to search recurring agreements.',
        variant: 'warning',
      });
      return;
    }

    setSearchingRecurring(true);

    try {
      const result = await searchRecurringAgreements({
        query: recurringSearchQuery.trim(),
      });
      setRecurringResults(result.agreements);

      await enqueueSnackbar({
        message:
          result.agreements.length === 0
            ? 'No recurring agreements matched the current search.'
            : `Found ${result.agreements.length} recurring agreement${result.agreements.length === 1 ? '' : 's'}.`,
        variant: 'info',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search recurring agreements.',
        variant: 'error',
      });
    } finally {
      setSearchingRecurring(false);
    }
  };

  const handleSearchOpportunities = async () => {
    if (!canSearchOpportunities) {
      await enqueueSnackbar({
        message: 'Enter at least two characters to search opportunities.',
        variant: 'warning',
      });
      return;
    }

    setSearchingOpportunities(true);

    try {
      const result = await searchOpportunities({
        query: opportunitySearchQuery.trim(),
        ...(selectedCompanyId ? { companyId: selectedCompanyId } : {}),
      });
      setOpportunityResults(result.opportunities);

      await enqueueSnackbar({
        message:
          result.opportunities.length === 0
            ? 'No opportunities matched the current search.'
            : `Found ${result.opportunities.length} opportunit${result.opportunities.length === 1 ? 'y' : 'ies'}.`,
        variant: 'info',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search opportunities.',
        variant: 'error',
      });
    } finally {
      setSearchingOpportunities(false);
    }
  };

  const runManualGiftDuplicateCheck = async (args: {
    donorType: ManualGiftDonorType;
    selectedDonorId?: string;
    selectedCompanyId?: string;
  }) => {
    const result = await checkManualGiftDuplicates({
      donorType: args.donorType,
      selectedDonorId: args.selectedDonorId,
      selectedCompanyId: args.selectedCompanyId,
      amountValue: amountValue.trim(),
      currencyCode,
      giftDate: giftDate.trim(),
    });

    setDuplicateGiftCheckResult(result);

    return result;
  };

  return (
    <div style={panelStyle}>
      <div style={sectionStyle}>
        <div style={sectionHeaderRowStyle}>
          <div style={sectionTitleStyle}>Donor context</div>
          <div style={segmentedControlStyle} role="tablist" aria-label="Donor type">
            {(['INDIVIDUAL', 'COMPANY'] as const).map((option) => {
              const isSelected = donorType === option;

              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  style={
                    isSelected
                      ? selectedSegmentedOptionStyle
                      : segmentedOptionStyle
                  }
                  onClick={() => {
                    setDonorType(option);
                  }}
                >
                  {option === 'INDIVIDUAL' ? 'Individual' : 'Company'}
                </button>
              );
            })}
          </div>
        </div>

        {donorType === 'INDIVIDUAL' ? (
          <>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>First name</span>
                <input
                  style={inputStyle}
                  value={donorFirstName}
                  onChange={(event) =>
                    setDonorFirstName(getInputEventValue(event))
                  }
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>Last name</span>
                <input
                  style={inputStyle}
                  value={donorLastName}
                  onChange={(event) =>
                    setDonorLastName(getInputEventValue(event))
                  }
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Email</span>
              <input
                style={inputStyle}
                type="email"
                value={donorEmail}
                onChange={(event) => setDonorEmail(getInputEventValue(event))}
              />
            </label>

            {duplicateInterruptionVisible && duplicateResult ? (
              <div style={inlineMatchSectionStyle}>
                <div style={sectionTitleStyle}>Donor match</div>
                <div style={secondaryTextStyle}>
                  {duplicateResult.status === 'SINGLE_EXACT_MATCH'
                    ? 'We found one donor with this name. Use that donor or continue with a new donor.'
                    : 'We found more than one donor with this name. Choose the right donor or continue with a new donor.'}
                </div>

                {donorChoice === 'USE_EXISTING' && selectedDonorSummary ? (
                  <div style={selectedSummaryStyle}>
                    <div style={selectedStateInfoStyle}>
                      <div style={sectionTitleStyle}>Selected donor</div>
                      <strong>{buildPersonDisplayName(selectedDonorSummary)}</strong>
                      <span style={secondaryTextStyle}>
                        {selectedDonorSummary.emails?.primaryEmail?.trim() ||
                          'No email on record'}
                      </span>
                    </div>
                    <button
                      type="button"
                      style={compactTextActionStyle}
                      onClick={() => {
                        setSelectedDonorId(null);
                        setDonorChoice(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {duplicateResult.candidates.map((candidate) => {
                        const isSelected = candidate.id === selectedDonorId;
                        const email = candidate.emails?.primaryEmail?.trim();

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedDonorId(candidate.id);
                              setDonorChoice('USE_EXISTING');
                            }}
                          >
                            <div style={compactMatchInfoStyle}>
                              <strong>{buildPersonDisplayName(candidate)}</strong>
                              <span style={secondaryTextStyle}>
                                {email === undefined || email === ''
                                  ? 'No email on record'
                                  : email}
                              </span>
                            </div>
                            <span style={compactMatchActionStyle}>
                              {isSelected ? 'Selected' : 'Use donor'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={secondaryChoiceRowStyle}>
                      <span style={secondaryTextStyle}>
                        No suitable donor listed?
                      </span>
                      <button
                        type="button"
                        style={compactTextActionStyle}
                        onClick={() => {
                          setSelectedDonorId(null);
                          setDonorChoice('CREATE_NEW');
                        }}
                      >
                        Create new donor
                      </button>
                    </div>
                  </>
                )}

              </div>
            ) : null}

            <div style={{ display: 'grid', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#1f2328',
                }}
              >
                <input
                  type="checkbox"
                  checked={includeDonorAddress}
                  onChange={(event) =>
                    setIncludeDonorAddress(getInputEventChecked(event))
                  }
                />
                <span>Add donor address</span>
              </label>

              {includeDonorAddress ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={bodyTextStyle}>
                    Address is only used if this gift creates a new donor.
                    Existing donor addresses are not updated in this flow.
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: '1fr 1fr',
                    }}
                  >
                    <label
                      style={{
                        display: 'grid',
                        gap: '6px',
                        gridColumn: '1 / -1',
                      }}
                    >
                      <span style={labelStyle}>Address line 1</span>
                      <input
                        style={inputStyle}
                        value={addressStreet1}
                        onChange={(event) =>
                          setAddressStreet1(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label
                      style={{
                        display: 'grid',
                        gap: '6px',
                        gridColumn: '1 / -1',
                      }}
                    >
                      <span style={labelStyle}>Address line 2</span>
                      <input
                        style={inputStyle}
                        value={addressStreet2}
                        onChange={(event) =>
                          setAddressStreet2(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>City</span>
                      <input
                        style={inputStyle}
                        value={addressCity}
                        onChange={(event) =>
                          setAddressCity(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>County / state</span>
                      <input
                        style={inputStyle}
                        value={addressState}
                        onChange={(event) =>
                          setAddressState(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Postcode</span>
                      <input
                        style={inputStyle}
                        value={addressPostcode}
                        onChange={(event) =>
                          setAddressPostcode(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Country</span>
                      <input
                        style={inputStyle}
                        value={addressCountry}
                        onChange={(event) =>
                          setAddressCountry(getInputEventValue(event))
                        }
                      />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Company name</span>
              <input
                style={inputStyle}
                value={companyName}
                onChange={(event) => setCompanyName(getInputEventValue(event))}
              />
            </label>
            <p style={bodyTextStyle}>
              Company gifts are matched against existing company records.
            </p>

            {companyDuplicateInterruptionVisible && companyDuplicateResult ? (
              <div style={inlineMatchSectionStyle}>
                <div style={sectionTitleStyle}>Company match</div>
                <div style={secondaryTextStyle}>
                  {companyDuplicateResult.status === 'SINGLE_EXACT_MATCH'
                    ? 'We found one company with this name. Use that company or continue with a new company.'
                    : 'We found more than one company with this name. Choose the right company or continue with a new company.'}
                </div>

                {companyChoice === 'USE_EXISTING' && selectedCompanySummary ? (
                  <div style={selectedSummaryStyle}>
                    <div style={selectedStateInfoStyle}>
                      <div style={sectionTitleStyle}>Selected company</div>
                      <strong>{buildCompanyDisplayName(selectedCompanySummary)}</strong>
                    </div>
                    <button
                      type="button"
                      style={compactTextActionStyle}
                      onClick={() => {
                        setSelectedCompanyId(null);
                        setCompanyChoice(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {companyDuplicateResult.candidates.map((candidate) => {
                        const isSelected = candidate.id === selectedCompanyId;

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedCompanyId(candidate.id);
                              setCompanyChoice('USE_EXISTING');
                            }}
                          >
                            <div style={compactMatchInfoStyle}>
                              <strong>{buildCompanyDisplayName(candidate)}</strong>
                            </div>
                            <span style={compactMatchActionStyle}>
                              {isSelected ? 'Selected' : 'Use company'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={secondaryChoiceRowStyle}>
                      <span style={secondaryTextStyle}>
                        No suitable company listed?
                      </span>
                      <button
                        type="button"
                        style={compactTextActionStyle}
                        onClick={() => {
                          setSelectedCompanyId(null);
                          setCompanyChoice('CREATE_NEW');
                        }}
                      >
                        Create new company
                      </button>
                    </div>
                  </>
                )}

              </div>
            ) : null}

            <div style={{ display: 'grid', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#1f2328',
                }}
              >
                <input
                  type="checkbox"
                  checked={linkOpportunity}
                  onChange={(event) => {
                    const checked = getInputEventChecked(event);
                    setLinkOpportunity(checked);

                    if (!checked) {
                      setOpportunitySearchQuery('');
                      setOpportunityResults([]);
                      setSelectedOpportunityId(null);
                    }
                  }}
                />
                <span>Link an opportunity</span>
              </label>

              {linkOpportunity ? (
                <>
                  <p style={bodyTextStyle}>
                    Add an opportunity when this gift relates to a grant,
                    sponsorship, or similar company gift.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'end',
                    }}
                  >
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Search opportunities</span>
                      <input
                        style={inputStyle}
                        value={opportunitySearchQuery}
                        placeholder={
                          selectedCompanyId
                            ? 'Opportunity name'
                            : 'Opportunity name (searches all companies)'
                        }
                        onChange={(event) =>
                          setOpportunitySearchQuery(getInputEventValue(event))
                        }
                      />
                    </label>

                    <div>
                      <Button
                        title={
                          searchingOpportunities ? 'Searching...' : 'Search'
                        }
                        variant="secondary"
                        onClick={() => {
                          void handleSearchOpportunities();
                        }}
                        disabled={
                          searchingOpportunities ||
                          submitting ||
                          !canSearchOpportunities
                        }
                      />
                    </div>
                  </div>

                  {opportunityResults.length > 0 ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {opportunityResults.map((opportunity) => {
                        const isSelected =
                          opportunity.id === selectedOpportunityId;

                        return (
                          <button
                            key={opportunity.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedOpportunityId(opportunity.id);
                            }}
                          >
                            <strong>
                              {buildOpportunityDisplayName(opportunity)}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </>
        )}

      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Gift basics</div>
        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Amount</span>
            <input
              style={inputStyle}
              inputMode="decimal"
              placeholder="25.00"
              value={amountValue}
              onChange={(event) => setAmountValue(getInputEventValue(event))}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Currency</span>
            <select
              style={inputStyle}
              value={currencyCode}
              onChange={(event) => setCurrencyCode(getInputEventValue(event))}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Payment type</span>
            <select
              style={inputStyle}
              value={paymentType}
              onChange={(event) =>
                setPaymentType(getInputEventValue(event) as ManualGiftPaymentType)
              }
            >
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Gift date</span>
            <input
              style={inputStyle}
              type="date"
              value={giftDate}
              onChange={(event) => setGiftDate(getInputEventValue(event))}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Appeal</span>
          <input
            style={inputStyle}
            value={appealName}
            placeholder="Appeal name"
            onChange={(event) => setAppealName(getInputEventValue(event))}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Recurring linkage</div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#1f2328',
          }}
        >
          <input
            type="checkbox"
            checked={linkRecurringAgreement}
            onChange={(event) => {
              const checked = getInputEventChecked(event);
              setLinkRecurringAgreement(checked);

              if (!checked) {
                setRecurringResults([]);
                setSelectedRecurringAgreementId(null);
                setRecurringSearchQuery('');
              }
            }}
            />
          <span>Link to an existing recurring agreement</span>
        </label>

        {linkRecurringAgreement ? (
          <>
            <p style={bodyTextStyle}>
              Use this only when the gift belongs to an existing recurring
              agreement.
            </p>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: '1fr auto',
                alignItems: 'end',
              }}
            >
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>Search recurring agreements</span>
                <input
                  style={inputStyle}
                  value={recurringSearchQuery}
                  placeholder="Donor name, agreement name, or reference"
                  onChange={(event) =>
                    setRecurringSearchQuery(getInputEventValue(event))
                  }
                />
              </label>

              <div>
                <Button
                  title={searchingRecurring ? 'Searching...' : 'Search'}
                  variant="secondary"
                  onClick={() => {
                    void handleSearchRecurringAgreements();
                  }}
                  disabled={searchingRecurring || submitting || !canSearchRecurring}
                />
              </div>
            </div>

            {recurringResults.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {recurringResults.map((agreement) => {
                  const isSelected =
                    agreement.id === selectedRecurringAgreementId;

                  return (
                    <button
                      key={agreement.id}
                      type="button"
                      style={
                        isSelected
                          ? selectedCandidateButtonStyle
                          : candidateButtonStyle
                      }
                      onClick={() => {
                        setSelectedRecurringAgreementId(agreement.id);
                      }}
                    >
                      <strong>
                        {buildRecurringAgreementDisplayName(agreement)}
                      </strong>
                      <span style={secondaryTextStyle}>
                        {agreement.status ?? 'Status unavailable'} ·{' '}
                        {agreement.nextExpectedAt ?? 'No next date'} ·{' '}
                        {agreement.provider ?? 'MANUAL'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <ManualGiftEntryGiftAidSection
        donorType={donorType}
        includedInFlow={isGiftAidEnabled}
        giftAidRequested={giftAidRequested}
        giftAidDeclarationCaptured={giftAidDeclarationCaptured}
        giftAidDeclarationDate={giftAidDeclarationDate}
        giftAidCoverageScope={giftAidCoverageScope}
        giftAidDeclarationSource={giftAidDeclarationSource}
        giftAidTextVersion={giftAidTextVersion}
        onGiftAidRequestedChange={setGiftAidRequested}
        onGiftAidDeclarationCapturedChange={setGiftAidDeclarationCaptured}
        onGiftAidDeclarationDateChange={setGiftAidDeclarationDate}
        onGiftAidCoverageScopeChange={setGiftAidCoverageScope}
        onGiftAidDeclarationSourceChange={setGiftAidDeclarationSource}
        onGiftAidTextVersionChange={setGiftAidTextVersion}
      />

      {duplicateGiftWarningVisible && duplicateGiftCheckResult ? (
        <div style={warningSectionStyle}>
          <div style={sectionTitleStyle}>Possible duplicate gift</div>
          <div style={secondaryTextStyle}>
            A gift with the same donor or company, amount, and date already
            exists or is waiting to be processed. This is a warning only. You
            can still create the gift if it is genuinely separate.
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {duplicateGiftCheckResult.matches.map(
              (match: ManualGiftDuplicateMatch) => (
                <div key={`${match.kind}:${match.id}`} style={candidateButtonStyle}>
                  <strong>{match.name}</strong>
                  <span style={secondaryTextStyle}>
                    {match.kind === 'COMMITTED_GIFT'
                      ? 'Committed gift'
                      : 'Staged gift'}{' '}
                    · {match.giftDate} ·{' '}
                    {formatAmountMicros(match.amountMicros, match.currencyCode)}
                  </span>
                  <span style={secondaryTextStyle}>
                    {match.status ?? 'Status unavailable'}
                    {match.giftBatchName ? ` · Batch: ${match.giftBatchName}` : ''}
                  </span>
                </div>
              ),
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              title="Create anyway"
              variant="secondary"
              onClick={() => {
                void handleSubmit(true);
              }}
              disabled={submitting}
            />
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button
          title="Cancel"
          variant="secondary"
          onClick={() => {
            void closeSidePanel();
          }}
          disabled={submitting}
        />
        <Button
          title={submitting ? 'Creating...' : 'Create gift'}
          variant="primary"
          accent="blue"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={submitting}
        />
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'new-gift',
  description: 'Creates a committed gift through the trusted manual-entry flow.',
  description: 'Creates a gift through manual entry.',
  component: NewGift,
  command: {
    universalIdentifier: NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'New gift',
    shortLabel: 'New gift',
    icon: 'IconGift',
    isPinned: true,
    availabilityType: 'GLOBAL',
  },
});
