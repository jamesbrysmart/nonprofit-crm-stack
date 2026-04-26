import type {
  DerivedReviewState,
  DonorResolution,
  ProcessingOutcome,
  StoredStagingReviewRecord,
  StagingReviewRecord,
  PersonSummary,
} from './staging-review.types';

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
): string => {
  const fullName = `${donorFirstName} ${donorLastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return donorEmail !== '' ? donorEmail : 'Unknown donor evidence';
};

export const mapDonorResolution = (
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

export const mapProcessingOutcome = (
  storedValue: string | null | undefined,
): ProcessingOutcome => {
  return storedValue === 'FAILED' ? 'FAILED' : 'NOT_RUN';
};

export const buildStagingReviewRecord = (
  stored: StoredStagingReviewRecord,
): StagingReviewRecord => {
  const donorFirstName = coalesceString(stored.donorFirstName);
  const donorLastName = coalesceString(stored.donorLastName);
  const donorEmail = coalesceString(stored.donorEmail);
  const linkedDonor = stored.donor ?? null;
  const linkedDonorName = buildPersonDisplayName(linkedDonor);

  return {
    id: stored.id,
    name: coalesceString(
      stored.name,
      buildEvidenceName(donorFirstName, donorLastName, donorEmail),
    ),
    donorFirstName,
    donorLastName,
    donorEmail,
    donorEvidenceName: buildEvidenceName(
      donorFirstName,
      donorLastName,
      donorEmail,
    ),
    amount: coalesceString(stored.amount, 'Unknown amount'),
    giftDate: stored.giftDate ?? null,
    donorResolution: mapDonorResolution(stored.donorResolutionState, linkedDonor),
    linkedDonor,
    linkedDonorName,
    giftAidRequested: stored.giftAidRequested ?? false,
    giftAidDeclarationCaptured: stored.giftAidDeclarationCaptured ?? false,
    giftAidDeclarationDate: stored.giftAidDeclarationDate ?? null,
    giftAidCoverageScope: coalesceString(stored.giftAidCoverageScope),
    giftAidDeclarationSource: coalesceString(stored.giftAidDeclarationSource),
    giftAidTextVersion: coalesceString(stored.giftAidTextVersion),
    giftAidDeclarationId: stored.giftAidDeclaration?.id ?? null,
    processingOutcome: mapProcessingOutcome(stored.processingOutcome),
    hasCoreGiftIssue: stored.hasCoreGiftIssue ?? false,
    isReadyForProcessing: stored.isReadyForProcessing ?? false,
  };
};

export const deriveReviewState = (
  record: StagingReviewRecord,
): DerivedReviewState => {
  const hasLinkedDonor = Boolean(record.linkedDonor?.id);
  const isReadyNow =
    record.isReadyForProcessing &&
    hasLinkedDonor &&
    !record.hasCoreGiftIssue &&
    record.processingOutcome !== 'FAILED';

  if (isReadyNow) {
    return {
      queueMeaning: 'READY_NOW',
      title: 'Ready now',
      accent: '#1a7f37',
      background: '#eef9f0',
      reason:
        'This row has explicit ready intent, no core gift issue, and a confirmed donor relation.',
      nextAction:
        'Return to the queue and continue to the next actionable row, or hand this row on to processing later.',
      hasBlocker: false,
    };
  }

  if (record.processingOutcome === 'FAILED') {
    return {
      queueMeaning: 'FAILED_FOLLOW_UP',
      title: 'Failed follow-up',
      accent: '#8a2d2d',
      background: '#fff5f5',
      reason:
        'A previous processing attempt failed. This row needs follow-up review before it can be made ready again.',
      nextAction:
        'Review the row, resolve any remaining issues, then explicitly mark it ready again when follow-up is complete.',
      hasBlocker: true,
    };
  }

  if (record.donorResolution === 'AMBIGUOUS') {
    return {
      queueMeaning: 'BLOCKED',
      title: 'Blocked by donor ambiguity',
      accent: '#9a6700',
      background: '#fff8c5',
      reason:
        'Incoming donor evidence maps to more than one plausible existing donor, so the row is blocked until someone chooses explicitly.',
      nextAction:
        'Choose one existing donor or leave the row unresolved for later review.',
      hasBlocker: true,
    };
  }

  if (record.hasCoreGiftIssue) {
    return {
      queueMeaning: 'BLOCKED',
      title: 'Blocked by core gift issue',
      accent: '#7c5700',
      background: '#fff8e1',
      reason:
        'A core gift fact still needs correction, so the row should not be readied yet.',
      nextAction:
        'Resolve the core gift issue, then decide whether the row is ready for processing.',
      hasBlocker: true,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'UNREVIEWED') {
    return {
      queueMeaning: 'NEEDS_DONOR_REVIEW',
      title: 'Needs donor review',
      accent: '#7c5d00',
      background: '#fff8e1',
      reason:
        'Incoming donor evidence exists, but no donor record has been explicitly linked yet.',
      nextAction:
        'Review exact donor matches and link the correct donor, or leave the row unresolved.',
      hasBlocker: false,
    };
  }

  if (!hasLinkedDonor && record.donorResolution === 'UNRESOLVED') {
    return {
      queueMeaning: 'ACTIVE_REVIEW',
      title: 'Active review / unresolved donor',
      accent: '#57606a',
      background: '#f6f8fa',
      reason:
        'The donor was reviewed and intentionally left unresolved, so the row remains in active review.',
      nextAction:
        'Return later when the donor can be linked, or keep working other actionable rows in the queue.',
      hasBlocker: false,
    };
  }

  return {
    queueMeaning: 'ACTIVE_REVIEW',
    title: 'Active review',
    accent: '#57606a',
    background: '#f6f8fa',
    reason:
      'The donor relation is set, but the reviewer has not yet expressed explicit readiness for processing.',
    nextAction:
      'Make any final corrections, then explicitly mark the row ready when you are satisfied.',
    hasBlocker: false,
  };
};

export const getDonorResolutionLabel = (value: DonorResolution) => {
  switch (value) {
    case 'CONFIRMED':
      return 'Confirmed';
    case 'AMBIGUOUS':
      return 'Ambiguous';
    case 'UNRESOLVED':
      return 'Unresolved';
    default:
      return 'Unreviewed';
  }
};

export const getProcessingOutcomeLabel = (value: ProcessingOutcome) => {
  return value === 'FAILED' ? 'Failed' : 'Not run';
};
