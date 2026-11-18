import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Status } from 'twenty-ui/primitives/data-display';
import type { ThemeColor } from 'twenty-ui/theme';
import { ChoiceCards, FormInput } from 'src/front-components/form-controls';
import {
  ActionButton,
  actionRowStyle,
  fieldGridStyle,
} from 'src/front-components/front-component-ui';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
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
import type { GiftStagingWorkspaceSectionProps } from 'src/gift-staging-review/workspace/workspace-section';
import { checkDonorDuplicates } from 'src/manual-gift-entry/manual-gift-entry.api';
import type { DuplicateCheckResponse } from 'src/manual-gift-entry/manual-gift-entry.types';

const TONE_COLORS: Record<'neutral' | 'success' | 'warning', ThemeColor> = {
  neutral: 'gray',
  success: 'green',
  warning: 'amber',
};

const normalizeEmail = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const StagingDonorReviewSection = ({
  recordId,
  record,
  onChanged,
}: GiftStagingWorkspaceSectionProps) => {
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DuplicateCheckResponse | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [donorFirstName, setDonorFirstName] = useState('');
  const [donorLastName, setDonorLastName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setDonorFirstName(record.donorFirstName);
    setDonorLastName(record.donorLastName);
    setDonorEmail(record.donorEmail);
  }, [record, isEditing]);

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
    const refreshedRecord = await onChanged();
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
    <WorkspaceSection
      title="Donor review"
      headerAction={
        <Status color={TONE_COLORS[donorState.tone]} weight="medium">
          {donorState.label}
        </Status>
      }
    >
      <div style={fieldGridStyle}>
        <FormInput
          label="First name"
          value={donorFirstName}
          onChange={(value) => {
            setIsEditing(true);
            setDonorFirstName(value);
          }}
          disabled={saving}
        />
        <FormInput
          label="Last name"
          value={donorLastName}
          onChange={(value) => {
            setIsEditing(true);
            setDonorLastName(value);
          }}
          disabled={saving}
        />
      </div>
      <FormInput
        label="Email"
        type="email"
        value={donorEmail}
        onChange={(value) => {
          setIsEditing(true);
          setDonorEmail(value);
        }}
        disabled={saving}
      />
      {record.donorMailingAddressDisplay !== '' ? (
        <WorkspaceText>Address: {record.donorMailingAddressDisplay}</WorkspaceText>
      ) : null}

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

      {record.linkedDonorName !== '' ? (
        <Callout
          status="neutral"
          title="Selected donor"
          description={
            <>
              {record.linkedDonorName} ·{' '}
              {linkedDonorPrimaryEmail !== ''
                ? linkedDonorPrimaryEmail
                : 'No email on record'}
              {hasDifferentStagedEmail
                ? '. This gift uses a different email and may update the donor during processing.'
                : ''}
            </>
          }
        />
      ) : null}

      {record.isAnonymousDonor ? (
        <Callout
          status="neutral"
          title="Anonymous donor"
          description="This gift is marked anonymous and will not link or create a donor when processed."
        />
      ) : null}

      {hasRecordedPrimaryEmailConflict && !duplicateCheckResult ? (
        <WorkspaceText>
          This email already belongs to an existing donor. Find matches to review
          that donor, or change the staged email before this row can create a new
          donor.
        </WorkspaceText>
      ) : null}

      {duplicateCheckResult ? (
        <>
          {hasPrimaryEmailConflictCandidate ? (
            <WorkspaceText>
              This email already belongs to an existing donor. Link that donor or
              change the staged email before this row can create a new donor.
            </WorkspaceText>
          ) : null}
          {duplicateCheckResult.candidates.length > 0 ? (
            <>
              <ChoiceCards
                ariaLabel="Possible donor matches"
                value={selectedDonorId}
                onChange={setSelectedDonorId}
                options={duplicateCheckResult.candidates.map((candidate) => {
                  const candidateAddress = buildAddressDisplay(
                    candidate.mailingAddress,
                  );

                  return {
                    value: candidate.id,
                    title: buildPersonDisplayName(candidate),
                    description: [
                      candidate.emails?.primaryEmail ?? 'No primary email',
                      candidateAddress !== '' ? `Address: ${candidateAddress}` : '',
                    ]
                      .filter((part) => part !== '')
                      .join(' · '),
                  };
                })}
              />
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
            </>
          ) : (
            <WorkspaceText>No close donor matches found.</WorkspaceText>
          )}
        </>
      ) : null}
    </WorkspaceSection>
  );
};
