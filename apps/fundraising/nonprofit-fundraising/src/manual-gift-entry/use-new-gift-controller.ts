import { useEffect, useMemo, useState } from 'react';
import { closeSidePanel, enqueueSnackbar } from 'twenty-sdk/front-component';
import {
  checkCompanyDuplicates,
  checkDonorDuplicates,
  checkManualGiftDuplicates,
  createManualGift,
  searchOpportunities,
  searchRecurringAgreements,
} from './manual-gift-entry.api';
import type {
  CompanyDuplicateCheckResponse,
  DuplicateCheckResponse,
  ManualGiftCompanyChoice,
  ManualGiftDonorChoice,
  ManualGiftDonorType,
  ManualGiftDuplicateCheckResponse,
  ManualGiftPaymentType,
  OpportunitySummary,
} from './manual-gift-entry.types';
import type { RecurringAgreementSummary } from 'src/recurring/recurring.types';
import {
  buildMailingAddressInput,
  findSelectedCompany,
  findSelectedDonor,
  normalizeName,
} from './new-gift-support';

export const useNewGiftController = () => {
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
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

  return {
    donorType,
    setDonorType,
    donorFirstName,
    setDonorFirstName,
    donorLastName,
    setDonorLastName,
    donorEmail,
    setDonorEmail,
    companyName,
    setCompanyName,
    amountValue,
    setAmountValue,
    currencyCode,
    setCurrencyCode,
    paymentType,
    setPaymentType,
    giftDate,
    setGiftDate,
    appealName,
    setAppealName,
    includeDonorAddress,
    setIncludeDonorAddress,
    addressStreet1,
    setAddressStreet1,
    addressStreet2,
    setAddressStreet2,
    addressCity,
    setAddressCity,
    addressState,
    setAddressState,
    addressPostcode,
    setAddressPostcode,
    addressCountry,
    setAddressCountry,
    giftAidRequested,
    setGiftAidRequested,
    giftAidDeclarationCaptured,
    setGiftAidDeclarationCaptured,
    giftAidDeclarationDate,
    setGiftAidDeclarationDate,
    giftAidCoverageScope,
    setGiftAidCoverageScope,
    giftAidDeclarationSource,
    setGiftAidDeclarationSource,
    giftAidTextVersion,
    setGiftAidTextVersion,
    linkRecurringAgreement,
    setLinkRecurringAgreement,
    recurringSearchQuery,
    setRecurringSearchQuery,
    recurringResults,
    selectedRecurringAgreementId,
    setSelectedRecurringAgreementId,
    searchingRecurring,
    duplicateResult,
    donorChoice,
    setDonorChoice,
    selectedDonorId,
    setSelectedDonorId,
    companyDuplicateResult,
    companyChoice,
    setCompanyChoice,
    selectedCompanyId,
    setSelectedCompanyId,
    linkOpportunity,
    setLinkOpportunity,
    opportunitySearchQuery,
    setOpportunitySearchQuery,
    opportunityResults,
    selectedOpportunityId,
    setSelectedOpportunityId,
    searchingOpportunities,
    duplicateGiftCheckResult,
    duplicateInterruptionVisible,
    companyDuplicateInterruptionVisible,
    duplicateGiftWarningVisible,
    selectedDonorSummary,
    selectedCompanySummary,
    canSearchRecurring,
    canSearchOpportunities,
    submitting,
    handleSubmit,
    handleSearchRecurringAgreements,
    handleSearchOpportunities,
  };
};
