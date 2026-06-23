import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import {
  ActionButton,
  actionRowStyle,
  badgeStyle,
  choiceButtonStyle,
  compactConfirmationCardStyle,
  compactDividerSectionStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  fieldGridStyle,
  fieldStackStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import {
  leaveUnresolved,
  linkDonor,
  markAnonymousDonor,
  saveDonorEvidence,
} from 'src/gift-staging-review/gift-staging-review.actions';
import {
  buildAddressDisplay,
  buildPersonDisplayName,
} from 'src/gift-staging-review/gift-staging-review.model';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';
import { checkDonorDuplicates } from 'src/manual-gift-entry/manual-gift-entry.api';
import type { DuplicateCheckResponse } from 'src/manual-gift-entry/manual-gift-entry.types';

export const GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '8f5c7544-8de6-4fb0-a878-353d3881e06f';

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

  if (
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    typeof event.target === 'object' &&
    event.target !== null &&
    'value' in event.target
  ) {
    return String(event.target.value ?? '');
  }

  return '';
};

const normalizeEmail = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const GiftStagingDonorReview = () => {
  const recordId = useRecordId();
  const { record, loading, error, refresh } = useGiftStagingReviewRecord(
    recordId,
  );
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DuplicateCheckResponse | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [showAddressFields] = useState(false);
  const [donorFirstName, setDonorFirstName] = useState('');
  const [donorLastName, setDonorLastName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!record || isEditing) {
      return;
    }

    setDonorFirstName(record.donorFirstName);
    setDonorLastName(record.donorLastName);
    setDonorEmail(record.donorEmail);
  }, [record, isEditing]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donor review...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const hasUnsavedEvidenceChanges =
    donorFirstName !== record.donorFirstName ||
    donorLastName !== record.donorLastName ||
    donorEmail !== record.donorEmail;
  const canMarkAnonymousDonor =
    !record.isAnonymousDonor &&
    record.donorFirstName.trim() === '' &&
    record.donorLastName.trim() === '' &&
    record.donorEmail.trim() === '';
  const linkedDonorPrimaryEmail = record.linkedDonor?.emails?.primaryEmail?.trim() ?? '';
  const stagedEmail = record.donorEmail.trim();
  const hasDifferentStagedEmail =
    record.linkedDonorName !== '' &&
    stagedEmail !== '' &&
    linkedDonorPrimaryEmail !== '' &&
    stagedEmail.toLowerCase() !== linkedDonorPrimaryEmail.toLowerCase();
  const hasRecordedPrimaryEmailConflict =
    record.errorDetail.includes('already the primary email');
  const emailConflictCandidates =
    duplicateCheckResult?.candidates.filter(
      (candidate) =>
        normalizeEmail(candidate.emails?.primaryEmail) !== '' &&
        normalizeEmail(candidate.emails?.primaryEmail) ===
          normalizeEmail(donorEmail),
    ) ?? [];
  const hasPrimaryEmailConflictCandidate =
    record.linkedDonorName === '' &&
    (hasRecordedPrimaryEmailConflict || emailConflictCandidates.length > 0);
  const canTreatAsNewDonor =
    record.donorResolution === 'AMBIGUOUS' ||
    (duplicateCheckResult?.candidates.length ?? 0) > 0;

  const donorState =
    record.isAnonymousDonor
      ? {
          label: 'Anonymous donor',
          tone: 'neutral' as const,
        }
      : record.linkedDonorName !== ''
      ? {
          label: 'Donor selected',
          tone: 'success' as const,
        }
      : duplicateCheckResult?.status === 'SINGLE_EXACT_MATCH'
        ? {
            label: 'Likely match',
            tone: 'warning' as const,
          }
        : duplicateCheckResult?.status === 'MULTIPLE_EXACT_MATCHES' &&
            duplicateCheckResult.candidates.length > 0
          ? {
              label: 'Choose a donor',
              tone: 'warning' as const,
            }
          : {
              label: 'No donor selected',
              tone: 'neutral' as const,
            };

  const afterMutationRefresh = async () => {
    const refreshedRecord = await refresh();
    setIsEditing(false);
    if (refreshedRecord) {
      setDonorFirstName(refreshedRecord.donorFirstName);
      setDonorLastName(refreshedRecord.donorLastName);
      setDonorEmail(refreshedRecord.donorEmail);
    }
    setDuplicateCheckResult(null);
    setSelectedDonorId(null);
  };

  const handleSaveDonorEvidence = async () => {
    setSaving(true);

    try {
      await saveDonorEvidence(recordId, {
        donorFirstName,
        donorLastName,
        donorEmail,
      });
      await enqueueSnackbar({
        message: 'Donor details saved.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save donor details.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckDonorMatches = async () => {
    setCheckingDuplicates(true);

    try {
      const result = await checkDonorDuplicates({
        donorFirstName,
        donorLastName,
        donorEmail,
      });
      setDuplicateCheckResult(result);
      setSelectedDonorId(
        result.status === 'SINGLE_EXACT_MATCH' && result.candidates[0]
          ? result.candidates[0].id
          : null,
      );
    } catch (checkError) {
      await enqueueSnackbar({
        message:
          checkError instanceof Error
            ? checkError.message
            : 'Unable to find donor matches.',
        variant: 'error',
      });
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleLinkDonor = async () => {
    if (!selectedDonorId) {
      await enqueueSnackbar({
        message: 'Select a donor first.',
        variant: 'warning',
      });
      return;
    }

    setSaving(true);

    try {
      await linkDonor(recordId, selectedDonorId);
      await enqueueSnackbar({
        message: 'Donor selected.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (linkError) {
      await enqueueSnackbar({
        message:
          linkError instanceof Error
            ? linkError.message
            : 'Unable to select donor.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveUnresolved = async () => {
    if (hasPrimaryEmailConflictCandidate) {
      await enqueueSnackbar({
        message:
          'This row cannot be treated as a new donor because the staged email already belongs to an existing donor. Link that donor or change the staged email first.',
        variant: 'warning',
      });
      return;
    }

    setSaving(true);

    try {
      await leaveUnresolved(recordId);
      await enqueueSnackbar({
        message:
          'This row will be treated as a new donor if it is otherwise safe to process.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to save donor review.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAnonymousDonor = async () => {
    setSaving(true);

    try {
      await markAnonymousDonor(recordId);
      await enqueueSnackbar({
        message: 'This row will process without linking or creating a donor.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to mark this row as anonymous.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <span style={badgeStyle(donorState.tone)}>{donorState.label}</span>
        <div style={actionRowStyle}>
          <ActionButton
            title="Save donor details"
            variant="secondary"
            onClick={() => {
              void handleSaveDonorEvidence();
            }}
            disabled={!hasUnsavedEvidenceChanges || saving || checkingDuplicates}
          />
          <ActionButton
            title={
              checkingDuplicates
                ? 'Checking...'
                : record.linkedDonorName !== ''
                  ? 'Choose different donor'
                  : 'Find matches'
            }
            variant="secondary"
            onClick={() => {
              void handleCheckDonorMatches();
            }}
            disabled={checkingDuplicates || saving}
          />
          {canTreatAsNewDonor ? (
            <ActionButton
              title="Treat as new donor"
              variant="secondary"
              onClick={() => {
                void handleLeaveUnresolved();
              }}
              disabled={saving}
            />
          ) : null}
          {canMarkAnonymousDonor ? (
            <ActionButton
              title="Mark anonymous donor"
              variant="secondary"
              onClick={() => {
                void handleMarkAnonymousDonor();
              }}
              disabled={saving}
            />
          ) : null}
        </div>
      </div>

      <div style={fieldGridStyle}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>First name</span>
          <input
            style={inputStyle}
            type="text"
            value={donorFirstName}
            onChange={(event) => {
              setIsEditing(true);
              setDonorFirstName(getInputEventValue(event));
            }}
            disabled={saving}
          />
        </label>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Last name</span>
          <input
            style={inputStyle}
            type="text"
            value={donorLastName}
            onChange={(event) => {
              setIsEditing(true);
              setDonorLastName(getInputEventValue(event));
            }}
            disabled={saving}
          />
        </label>
      </div>
      <div style={fieldStackStyle}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Email</span>
          <input
            style={inputStyle}
            type="email"
            value={donorEmail}
            onChange={(event) => {
              setIsEditing(true);
              setDonorEmail(getInputEventValue(event));
            }}
            disabled={saving}
          />
        </label>
        {record.donorMailingAddressDisplay !== '' ? (
          <div style={secondaryTextStyle}>
            Address: {record.donorMailingAddressDisplay}
          </div>
        ) : null}
      </div>

      {showAddressFields ? (
        <div style={secondaryTextStyle}>Address fields not wired yet.</div>
      ) : null}

      {record.linkedDonorName !== '' ? (
        <div style={compactConfirmationCardStyle}>
          <div style={labelStyle}>Selected donor</div>
          <div style={compactValueStyle}>{record.linkedDonorName}</div>
          <div style={secondaryTextStyle}>
            {linkedDonorPrimaryEmail !== ''
              ? linkedDonorPrimaryEmail
              : 'No email on record'}
          </div>
          {hasDifferentStagedEmail ? (
            <div style={secondaryTextStyle}>
              This gift uses a different email and may update the donor during processing.
            </div>
          ) : null}
        </div>
      ) : null}

      {record.isAnonymousDonor ? (
        <div style={compactConfirmationCardStyle}>
          <div style={labelStyle}>Anonymous donor</div>
          <div style={secondaryTextStyle}>
            This gift is marked anonymous and will not link or create a donor
            when processed.
          </div>
        </div>
      ) : null}

      {hasRecordedPrimaryEmailConflict && !duplicateCheckResult ? (
        <div style={secondaryTextStyle}>
          This email already belongs to an existing donor. Find matches to review
          that donor, or change the staged email before this row can create a new
          donor.
        </div>
      ) : null}

      {duplicateCheckResult ? (
        <div
          style={{
            ...compactDividerSectionStyle,
            ...fieldStackStyle,
            gap: '6px',
          }}
        >
          {hasPrimaryEmailConflictCandidate ? (
            <div style={secondaryTextStyle}>
              This email already belongs to an existing donor. Link that donor or
              change the staged email before this row can create a new donor.
            </div>
          ) : null}
          {duplicateCheckResult.candidates.map((candidate) => {
            const selected = candidate.id === selectedDonorId;
            const candidateAddress = buildAddressDisplay(
              candidate.mailingAddress,
            );

            return (
              <button
                key={candidate.id}
                type="button"
                style={choiceButtonStyle(selected)}
                onClick={() => setSelectedDonorId(candidate.id)}
              >
                <strong>{buildPersonDisplayName(candidate)}</strong>
                <span style={secondaryTextStyle}>
                  {candidate.emails?.primaryEmail ?? 'No primary email'}
                </span>
                {candidateAddress !== '' ? (
                  <span style={secondaryTextStyle}>
                    Address: {candidateAddress}
                  </span>
                ) : null}
              </button>
            );
          })}

          {duplicateCheckResult.candidates.length > 0 ? (
            <div>
              <ActionButton
                title="Use selected donor"
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleLinkDonor();
                }}
                disabled={!selectedDonorId || saving}
              />
            </div>
          ) : (
            <div style={secondaryTextStyle}>No close donor matches found.</div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-donor-review',
  description:
    'Editable donor evidence and donor matching for staged gifts.',
  component: GiftStagingDonorReview,
});
