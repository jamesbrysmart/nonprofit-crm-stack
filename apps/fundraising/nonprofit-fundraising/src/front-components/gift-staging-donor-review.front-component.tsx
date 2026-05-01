import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  leaveUnresolved,
  linkDonor,
  saveDonorEvidence,
} from 'src/gift-staging-review/gift-staging-review.actions';
import { buildPersonDisplayName } from 'src/gift-staging-review/gift-staging-review.model';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';
import { checkDonorDuplicates } from 'src/manual-gift-entry/manual-gift-entry.api';
import type { DuplicateCheckResponse } from 'src/manual-gift-entry/manual-gift-entry.types';

export const GIFT_STAGING_DONOR_REVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '8f5c7544-8de6-4fb0-a878-353d3881e06f';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: '#ffffff',
  fontFamily: 'Inter, sans-serif',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
  fontWeight: 500,
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
  width: '100%',
  boxSizing: 'border-box',
};

const badgeStyle = (
  colors: 'neutral' | 'warning' | 'success',
): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  background:
    colors === 'success'
      ? '#dcfce7'
      : colors === 'warning'
        ? '#fef3c7'
        : '#e5e7eb',
  color:
    colors === 'success'
      ? '#166534'
      : colors === 'warning'
        ? '#92400e'
        : '#374151',
});

const candidateButtonStyle = (selected: boolean): CSSProperties => ({
  width: '100%',
  border: selected ? '1px solid #1f6feb' : '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'left',
  background: selected ? '#eef4ff' : '#ffffff',
  cursor: 'pointer',
  display: 'grid',
  gap: '4px',
});

const sectionStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

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

  useEffect(() => {
    if (!record) {
      return;
    }

    setDonorFirstName(record.donorFirstName);
    setDonorLastName(record.donorLastName);
    setDonorEmail(record.donorEmail);
  }, [record]);

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

  const donorState =
    record.linkedDonorName !== ''
      ? {
          label: 'Donor linked',
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
              label: 'Review matches',
              tone: 'warning' as const,
            }
          : {
              label: 'No donor linked',
              tone: 'neutral' as const,
            };

  const afterMutationRefresh = async () => {
    await refresh();
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
        message: 'Donor evidence saved.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save donor evidence.',
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
            : 'Unable to check donor matches.',
        variant: 'error',
      });
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleLinkDonor = async () => {
    if (!selectedDonorId) {
      await enqueueSnackbar({
        message: 'Select the donor to link first.',
        variant: 'warning',
      });
      return;
    }

    setSaving(true);

    try {
      await linkDonor(recordId, selectedDonorId);
      await enqueueSnackbar({
        message: 'Donor linked.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (linkError) {
      await enqueueSnackbar({
        message:
          linkError instanceof Error
            ? linkError.message
            : 'Unable to link donor.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveUnresolved = async () => {
    setSaving(true);

    try {
      await leaveUnresolved(recordId);
      await enqueueSnackbar({
        message: 'Row left unresolved for later review.',
        variant: 'success',
      });
      await afterMutationRefresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to update donor resolution.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={labelStyle}>Donor match</div>
        <span style={badgeStyle(donorState.tone)}>{donorState.label}</span>
      </div>

      <div style={sectionStyle}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>First name</span>
          <input
            style={inputStyle}
            type="text"
            value={donorFirstName}
            onChange={(event) => setDonorFirstName(event.target.value)}
            disabled={saving}
          />
        </label>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Last name</span>
          <input
            style={inputStyle}
            type="text"
            value={donorLastName}
            onChange={(event) => setDonorLastName(event.target.value)}
            disabled={saving}
          />
        </label>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Email</span>
          <input
            style={inputStyle}
            type="email"
            value={donorEmail}
            onChange={(event) => setDonorEmail(event.target.value)}
            disabled={saving}
          />
        </label>
      </div>

      {showAddressFields ? (
        <div style={secondaryTextStyle}>Address fields not wired yet.</div>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          title="Save donor evidence"
          variant="secondary"
          onClick={() => {
            void handleSaveDonorEvidence();
          }}
          disabled={!hasUnsavedEvidenceChanges || saving || checkingDuplicates}
        />
        <Button
          title={checkingDuplicates ? 'Checking...' : 'Check donor matches'}
          variant="secondary"
          onClick={() => {
            void handleCheckDonorMatches();
          }}
          disabled={checkingDuplicates || saving}
        />
        <Button
          title="Leave unresolved"
          variant="secondary"
          onClick={() => {
            void handleLeaveUnresolved();
          }}
          disabled={saving}
        />
      </div>

      {record.linkedDonorName !== '' ? (
        <div style={{ ...sectionStyle, padding: '12px', border: '1px solid #d8dee4', borderRadius: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2328' }}>
            {record.linkedDonorName}
          </div>
          <div style={secondaryTextStyle}>
            {record.linkedDonorId === ''
              ? 'Linked donor recorded.'
              : `Donor ID ${record.linkedDonorId}`}
          </div>
        </div>
      ) : null}

      {duplicateCheckResult ? (
        <div style={sectionStyle}>
          {duplicateCheckResult.candidates.map((candidate) => {
            const selected = candidate.id === selectedDonorId;

            return (
              <button
                key={candidate.id}
                type="button"
                style={candidateButtonStyle(selected)}
                onClick={() => setSelectedDonorId(candidate.id)}
              >
                <strong>{buildPersonDisplayName(candidate)}</strong>
                <span style={secondaryTextStyle}>
                  {candidate.emails?.primaryEmail ?? 'No primary email'}
                </span>
              </button>
            );
          })}

          {duplicateCheckResult.candidates.length > 0 ? (
            <div>
              <Button
                title="Link selected donor"
                variant="primary"
                accent="blue"
                onClick={() => {
                  void handleLinkDonor();
                }}
                disabled={!selectedDonorId || saving}
              />
            </div>
          ) : (
            <div style={secondaryTextStyle}>No exact donor matches found.</div>
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
