import type {
  DerivedReviewState,
  DonorResolution,
  GiftStagingReviewRecord,
  ProcessingStatus,
  StoredGiftStagingRecord,
} from './gift-staging-review.types';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';
import { isGiftStagingProcessable } from './gift-staging-processability';

const coalesceString = (
  value: string | null | undefined,
  fallback = '',
): string => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();

  return trimmed === '' ? fallback : trimmed;
};

export const buildPersonDisplayName = (person: PersonSummary | null): string => {
  if (!person) {
    return '';
  }

  const firstName = coalesceString(person.name?.firstName);
  const lastName = coalesceString(person.name?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return coalesceString(person.emails?.primaryEmail, 'Linked donor');
};

const buildEvidenceName = (
  donorFirstName: string,
  donorLastName: string,
  donorEmail: string,
) => {
  const fullName = `${donorFirstName} ${donorLastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return donorEmail !== '' ? donorEmail : 'Unknown donor evidence';
};

const formatAmountDisplay = (
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | string
    | null,
) => {
  if (typeof amount === 'string') {
    return coalesceString(amount, 'Unknown amount');
  }

  if (!amount || typeof amount.amountMicros !== 'number') {
    return 'Unknown amount';
  }

  const currencyCode = coalesceString(amount.currencyCode, 'GBP');

  return `${currencyCode} ${(amount.amountMicros / 1_000_000).toFixed(2)}`;
};

const mapDonorResolution = (
  storedValue: string | null | undefined,
  linkedDonor: PersonSummary | null,
): DonorResolution => {
  if (linkedDonor) {
    return 'CONFIRMED';
  }

  switch (storedValue) {
    case 'CONFIRMED':
      return 'CONFIRMED';
    case 'UNRESOLVED':
      return 'UNRESOLVED';
    case 'AMBIGUOUS':
      return 'AMBIGUOUS';
    default:
      return 'UNREVIEWED';
  }
};

const mapProcessingStatus = (
  storedValue: string | null | undefined,
): ProcessingStatus => {
  switch (storedValue) {
    case 'PROCESSED':
      return 'PROCESSED';
    case 'PROCESS_FAILED':
      return 'PROCESS_FAILED';
    default:
      return 'NOT_READY';
  }
};

export const buildGiftStagingReviewRecord = (
  stored: StoredGiftStagingRecord,
): GiftStagingReviewRecord => {
  const donorFirstName = coalesceString(stored.donorFirstName);
  const donorLastName = coalesceString(stored.donorLastName);
  const donorEmail = coalesceString(stored.donorEmail);
  const linkedDonor = stored.donor ?? null;

  return {
    id: stored.id,
    name: coalesceString(
      stored.name,
      buildEvidenceName(donorFirstName, donorLastName, donorEmail),
    ),
    intakeSource: coalesceString(stored.intakeSource, 'Unknown source'),
    amountDisplay: formatAmountDisplay(stored.amount),
    giftDate: coalesceString(stored.giftDate),
    donationType: coalesceString(stored.donationType),
    donorFirstName,
    donorLastName,
    donorEmail,
    donorPhone: coalesceString(stored.donorPhone),
    externalId: coalesceString(stored.externalId),
    sourceFingerprint: coalesceString(stored.sourceFingerprint),
    providerEventId: coalesceString(stored.providerEventId),
    provider: coalesceString(stored.provider),
    providerPaymentId: coalesceString(stored.providerPaymentId),
    paymentProviderCustomerId: coalesceString(
      stored.paymentProviderCustomerId,
    ),
    providerAgreementId: coalesceString(stored.providerAgreementId),
    providerIntervalUnit: coalesceString(stored.providerIntervalUnit),
    providerIntervalCount:
      typeof stored.providerIntervalCount === 'number'
        ? stored.providerIntervalCount
        : null,
    rawProviderEvidence: stored.rawProviderEvidence ?? null,
    donorEvidenceName: buildEvidenceName(
      donorFirstName,
      donorLastName,
      donorEmail,
    ),
    donorResolution: mapDonorResolution(
      stored.donorResolutionState,
      linkedDonor,
    ),
    linkedDonor,
    linkedDonorName: buildPersonDisplayName(linkedDonor),
    hasCoreGiftIssue: stored.hasCoreGiftIssue ?? false,
    isReadyForProcessing: stored.isReadyForProcessing ?? false,
    processingStatus: mapProcessingStatus(stored.processingStatus),
    errorDetail: coalesceString(stored.errorDetail),
    giftAidRequested: stored.giftAidRequested ?? false,
    giftAidDeclarationCaptured: stored.giftAidDeclarationCaptured ?? false,
    giftAidDeclarationDate: coalesceString(stored.giftAidDeclarationDate),
    giftAidCoverageScope: coalesceString(stored.giftAidCoverageScope),
    giftAidDeclarationSource: coalesceString(stored.giftAidDeclarationSource),
    giftAidTextVersion: coalesceString(stored.giftAidTextVersion),
    giftAidDeclarationId: coalesceString(stored.giftAidDeclaration?.id),
    giftBatchId: coalesceString(stored.giftBatch?.id),
    giftBatchName: coalesceString(stored.giftBatch?.name, 'No batch'),
    committedGiftId: coalesceString(stored.committedGift?.id),
    committedGiftName: coalesceString(
      stored.committedGift?.name,
      stored.committedGift?.id ? 'Committed gift linked' : 'Not processed',
    ),
  };
};

export const deriveReviewState = (
  record: GiftStagingReviewRecord,
): DerivedReviewState => {
  const hasLinkedDonor = Boolean(record.linkedDonor?.id);
  const isProcessable = isGiftStagingProcessable({
    processingStatus: record.processingStatus,
    hasCoreGiftIssue: record.hasCoreGiftIssue,
    donorResolutionState: record.donorResolution,
    donorFirstName: record.donorFirstName,
    donorLastName: record.donorLastName,
    linkedDonorId: record.linkedDonor?.id,
  });

  if (record.processingStatus === 'PROCESSED') {
    return {
      title: 'Processed',
      accent: '#1a7f37',
      background: '#eef9f0',
      reason:
        'This staging row has already been processed into a committed gift.',
      nextAction:
        record.committedGiftId !== ''
          ? 'Use the committed gift link for any further gift-level review.'
          : 'This row no longer needs staging review.',
      hasBlocker: false,
    };
  }

  if (isProcessable) {
    return {
      title: record.isReadyForProcessing ? 'Ready' : 'Eligible now',
      accent: '#1a7f37',
      background: '#eef9f0',
      reason: record.isReadyForProcessing
        ? 'This row has been reviewed and marked ready, and it has no active blockers.'
        : 'This row has no active blockers and enough donor context to process safely.',
      nextAction:
        record.isReadyForProcessing
          ? 'Process now, or return to the queue or batch scope and keep using ready as your reviewed marker.'
          : 'Process now, or mark the row ready if you want to record that review is complete.',
      hasBlocker: false,
    };
  }

  if (record.processingStatus === 'PROCESS_FAILED') {
    return {
      title: 'Failed follow-up',
      accent: '#8a2d2d',
      background: '#fff5f5',
      reason:
        'A previous processing attempt failed, so this row needs follow-up review before it can be made ready again.',
      nextAction:
        'Resolve the error detail or core issue, then mark the row ready again when follow-up is complete.',
      hasBlocker: true,
    };
  }

  if (record.hasCoreGiftIssue) {
    return {
      title: 'Blocked by core gift issue',
      accent: '#7c5700',
      background: '#fff8e1',
      reason:
        'A core gift fact still needs correction, so this row should not be readied yet.',
      nextAction:
        'Fix the core issue first, then decide whether the row is ready for processing.',
      hasBlocker: true,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'AMBIGUOUS') {
    return {
      title: 'Blocked by donor ambiguity',
      accent: '#9a6700',
      background: '#fff8c5',
      reason:
        'Incoming donor evidence maps to more than one plausible donor, so the row is blocked until someone chooses explicitly.',
      nextAction:
        'Choose an existing donor or leave the row unresolved for later review.',
      hasBlocker: true,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'UNREVIEWED') {
    return {
      title: 'Needs donor review',
      accent: '#7c5d00',
      background: '#fff8e1',
      reason:
        'No donor decision has been made yet. Review possible matches or confirm this should process as a new donor.',
      nextAction:
        'Check exact donor matches and link the right donor, or leave the row unresolved once you are satisfied.',
      hasBlocker: false,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'UNRESOLVED') {
    return {
      title: 'Donor reviewed, not linked',
      accent: '#57606a',
      background: '#f6f8fa',
      reason:
        'The donor was reviewed and left without an existing donor link. This row can still process by creating a new donor when you are satisfied.',
      nextAction:
        'Mark the row ready when you are satisfied, or return later if more donor review is needed.',
      hasBlocker: false,
    };
  }

  return {
    title: 'Active review',
    accent: '#57606a',
    background: '#f6f8fa',
    reason:
      'The donor relation is set, but the reviewer has not yet expressed explicit readiness for processing.',
    nextAction:
      'Make any final corrections, then mark the row ready when you are satisfied.',
    hasBlocker: false,
  };
};
