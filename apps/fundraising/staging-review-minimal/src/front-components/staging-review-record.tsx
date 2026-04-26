import { useEffect, useState, type CSSProperties } from 'react';
import {
  closeSidePanel,
  defineFrontComponent,
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  clearCoreGiftIssue,
  flagCoreGiftIssue,
  leaveUnresolved,
  linkDonor,
  markReady,
  saveGiftDate,
} from 'src/staging-review/staging-review.actions';
import {
  buildPersonDisplayName,
  buildStagingReviewRecord,
  deriveReviewState,
  getDonorResolutionLabel,
  getProcessingOutcomeLabel,
} from 'src/staging-review/staging-review.model';
import type {
  DonorDuplicateCheckResult,
  PersonSummary,
  StoredStagingReviewRecord,
  StagingReviewRecord,
} from 'src/staging-review/staging-review.types';

export const STAGING_REVIEW_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ba6ab2cd-bbf4-4f01-b5b0-f3929d611084';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const valueStyle: CSSProperties = {
  fontSize: '15px',
  color: '#1f2328',
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
};

const buttonBaseStyle: CSSProperties = {
  borderRadius: '6px',
  padding: '10px 14px',
  font: 'inherit',
  cursor: 'pointer',
};

const primaryButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: 'none',
  background: '#1f6feb',
  color: '#ffffff',
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: '1px solid #d0d7de',
  background: '#ffffff',
  color: '#1f2328',
};

const successButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: '1px solid #1a7f37',
  background: '#eef9f0',
  color: '#1a7f37',
};

const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'false').toLowerCase() === 'true';

const disabledButtonStyle: CSSProperties = {
  cursor: 'default',
  opacity: 0.65,
};

const formatDateTimeLocalValue = (value: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getEventDetailValue = (event: unknown) => {
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

const loadStoredRecord = async (
  recordId: string,
): Promise<StoredStagingReviewRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    stagingReviewItem: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      amount: true,
      giftDate: true,
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: true,
      giftAidCoverageScope: true,
      giftAidDeclarationSource: true,
      giftAidTextVersion: true,
      giftAidDeclaration: {
        id: true,
      },
      donorResolutionState: true,
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
      },
      processingOutcome: true,
      hasCoreGiftIssue: true,
      isReadyForProcessing: true,
    },
  } as any);

  return (result?.stagingReviewItem as StoredStagingReviewRecord | null) ?? null;
};

const checkDonorDuplicates = async (
  donorFirstName: string,
  donorLastName: string,
): Promise<DonorDuplicateCheckResult> => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  const response = await fetch(
    `${apiBaseUrl}/s/donor-resolution/check-donor-duplicates`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        donorFirstName,
        donorLastName,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Duplicate check failed with status ${response.status}`);
  }

  return (await response.json()) as DonorDuplicateCheckResult;
};

const ReviewCard = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<StagingReviewRecord | null>(null);
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DonorDuplicateCheckResult | null>(null);
  const [giftDateInput, setGiftDateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecord = async () => {
    if (!recordId) {
      setError('No record selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedRecord = await loadStoredRecord(recordId);
      setDuplicateCheckResult(null);

      if (!loadedRecord) {
        setRecord(null);
        setError('Record not found');
        return;
      }

      const nextRecord = buildStagingReviewRecord(loadedRecord);
      setRecord(nextRecord);
      setGiftDateInput(formatDateTimeLocalValue(nextRecord.giftDate));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : String(loadError),
      );
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecord();
  }, [recordId]);

  const runAction = async (
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    setSaving(true);

    try {
      await action();
      await enqueueSnackbar({
        message: successMessage,
        variant: 'success',
      });
      await loadRecord();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error ? saveError.message : 'Update failed',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGiftDate = async () => {
    if (!record) {
      return;
    }

    await runAction(
      () => saveGiftDate(record.id, giftDateInput),
      'Gift date saved. Ready intent cleared until review is confirmed again.',
    );
  };

  const handleLinkDonor = async (donor: PersonSummary) => {
    if (!record) {
      return;
    }

    await runAction(
      () => linkDonor(record.id, donor.id),
      `Linked donor ${buildPersonDisplayName(donor)}. The row remains in review until you explicitly mark it ready.`,
    );
  };

  const handleCheckDonorDuplicates = async () => {
    if (!record) {
      return;
    }

    setCheckingDuplicates(true);

    try {
      const result = await checkDonorDuplicates(
        record.donorFirstName,
        record.donorLastName,
      );
      setDuplicateCheckResult(result);

      const message =
        result.status === 'NO_MATCH'
          ? 'No exact donor duplicates found.'
          : result.status === 'SINGLE_EXACT_MATCH'
            ? 'One exact donor match found.'
            : 'Multiple exact donor matches found.';

      await enqueueSnackbar({
        message,
        variant: 'info',
      });
    } catch (checkError) {
      await enqueueSnackbar({
        message:
          checkError instanceof Error
            ? checkError.message
            : 'Unable to check donor duplicates.',
        variant: 'error',
      });
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleLeaveUnresolved = async () => {
    if (!record) {
      return;
    }

    await runAction(
      () => leaveUnresolved(record.id),
      'Row left unresolved for now. It remains in active review until a donor is explicitly linked.',
    );
  };

  const handleClearCoreGiftIssue = async () => {
    if (!record) {
      return;
    }

    await runAction(
      () => clearCoreGiftIssue(record.id),
      'Core gift issue cleared. The row remains in review until ready is explicitly confirmed.',
    );
  };

  const handleFlagCoreGiftIssue = async () => {
    if (!record) {
      return;
    }

    await runAction(
      () => flagCoreGiftIssue(record.id),
      'Core gift issue flagged. The row is now blocked until it is resolved.',
    );
  };

  const handleMarkReady = async () => {
    if (!record) {
      return;
    }

    if (!record.linkedDonor?.id) {
      await enqueueSnackbar({
        message: 'Link a donor before marking this row ready.',
        variant: 'warning',
      });
      return;
    }

    if (record.hasCoreGiftIssue) {
      await enqueueSnackbar({
        message: 'Resolve the core gift issue before marking this row ready.',
        variant: 'warning',
      });
      return;
    }

    await runAction(
      () => markReady(record.id, record.processingOutcome),
      record.processingOutcome === 'FAILED'
        ? 'Failed follow-up complete. The row is ready again.'
        : 'Marked ready. Continue through the queue while context is still fresh.',
    );
  };

  const returnToQueue = async () => {
    try {
      await closeSidePanel();
    } catch {
      await enqueueSnackbar({
        message:
          'Close the review panel and continue in the queue if side-panel close is unavailable here.',
        variant: 'info',
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        Loading review item...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div
        style={{
          padding: '20px',
          fontFamily: 'sans-serif',
          color: '#8a2d2d',
        }}
      >
        {error ?? 'Record unavailable'}
      </div>
    );
  }

  const derived = deriveReviewState(record);
  const candidateMatches = duplicateCheckResult?.candidates ?? [];

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={labelStyle}>Queue item</div>
            <div style={{ ...valueStyle, fontWeight: 600 }}>{record.name}</div>
          </div>
          <div
            style={{
              alignSelf: 'flex-start',
              borderRadius: '999px',
              padding: '6px 10px',
              background: derived.background,
              color: derived.accent,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {derived.title}
          </div>
        </div>

        <div style={{ ...secondaryTextStyle, color: derived.accent }}>
          {derived.reason}
        </div>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <div>
            <div style={labelStyle}>Donor resolution</div>
            <div style={valueStyle}>
              {getDonorResolutionLabel(record.donorResolution)}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Processing outcome</div>
            <div style={valueStyle}>
              {getProcessingOutcomeLabel(record.processingOutcome)}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Ready intent</div>
            <div style={valueStyle}>
              {record.isReadyForProcessing ? 'Marked ready' : 'Not marked ready'}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Core gift issue</div>
            <div style={valueStyle}>
              {record.hasCoreGiftIssue ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div>
          <div style={labelStyle}>What the operator should do next</div>
          <div style={secondaryTextStyle}>{derived.nextAction}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: '#1f2328' }}>Donor review</div>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <div>
            <div style={labelStyle}>Incoming donor evidence</div>
            <div style={valueStyle}>{record.donorEvidenceName}</div>
            {record.donorEmail ? (
              <div style={secondaryTextStyle}>{record.donorEmail}</div>
            ) : null}
          </div>
          <div>
            <div style={labelStyle}>Confirmed donor relation</div>
            <div style={valueStyle}>
              {record.linkedDonorName || 'No donor linked yet'}
            </div>
            {record.linkedDonor?.emails?.primaryEmail ? (
              <div style={secondaryTextStyle}>
                {record.linkedDonor.emails.primaryEmail}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div style={labelStyle}>Duplicate check</div>
          <div style={secondaryTextStyle}>
            This check now runs through an app-owned route function, not local
            front-component filtering. It is the first real Twenty-apps proof of
            the donor-duplicate boundary.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void handleCheckDonorDuplicates()}
            disabled={checkingDuplicates || saving}
            style={{
              ...primaryButtonStyle,
              ...(checkingDuplicates || saving ? disabledButtonStyle : {}),
            }}
          >
            {checkingDuplicates
              ? 'Checking exact name matches...'
              : 'Check donor duplicates'}
          </button>
          <button
            type="button"
            onClick={() => void handleLeaveUnresolved()}
            disabled={saving}
            style={{
              ...secondaryButtonStyle,
              ...(saving ? disabledButtonStyle : {}),
            }}
          >
            Leave unresolved for now
          </button>
        </div>

        {duplicateCheckResult ? (
          <div>
            <div style={labelStyle}>Duplicate check result</div>
            <div style={secondaryTextStyle}>
              {duplicateCheckResult.status === 'NO_MATCH'
                ? 'No exact first-name / last-name matches were found.'
                : duplicateCheckResult.status === 'SINGLE_EXACT_MATCH'
                  ? 'One exact existing donor match was found.'
                  : 'Multiple exact existing donor matches were found, so the row remains ambiguity-sensitive until a reviewer chooses explicitly.'}
            </div>
          </div>
        ) : null}

        <div>
          <div style={labelStyle}>Exact existing donor matches</div>
          {duplicateCheckResult === null ? (
            <div style={secondaryTextStyle}>
              Run the donor duplicate check to evaluate exact first-name /
              last-name matches against existing Twenty person records.
            </div>
          ) : candidateMatches.length === 0 ? (
            <div style={secondaryTextStyle}>
              No exact first-name / last-name matches found.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {candidateMatches.map((person) => {
                const personName = buildPersonDisplayName(person);
                const isLinked = record.linkedDonor?.id === person.id;

                return (
                  <div
                    key={person.id}
                    style={{
                      border: '1px solid #d8dee4',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <div style={valueStyle}>{personName}</div>
                      <div style={secondaryTextStyle}>
                        {person.emails?.primaryEmail || person.id}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleLinkDonor(person)}
                      disabled={saving || isLinked}
                      style={{
                        ...successButtonStyle,
                        ...(saving || isLinked ? disabledButtonStyle : {}),
                      }}
                    >
                      {isLinked ? 'Linked' : 'Link donor'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: '#1f2328' }}>Gift detail review</div>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          }}
        >
          <div>
            <div style={labelStyle}>Amount</div>
            <div style={valueStyle}>{record.amount}</div>
          </div>
          <div>
            <div style={labelStyle}>Current gift date</div>
            <div style={valueStyle}>
              {record.giftDate
                ? new Date(record.giftDate).toLocaleString()
                : 'No gift date set'}
            </div>
          </div>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={labelStyle}>Correct gift date</span>
          <input
            type="datetime-local"
            value={giftDateInput}
            onChange={(event) => setGiftDateInput(getEventDetailValue(event))}
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void handleSaveGiftDate()}
            disabled={saving}
            style={{
              ...primaryButtonStyle,
              ...(saving ? disabledButtonStyle : {}),
            }}
          >
            Save gift date
          </button>
          {record.hasCoreGiftIssue ? (
            <button
              type="button"
              onClick={() => void handleClearCoreGiftIssue()}
              disabled={saving}
              style={{
                ...successButtonStyle,
                ...(saving ? disabledButtonStyle : {}),
              }}
            >
              Clear core gift issue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleFlagCoreGiftIssue()}
              disabled={saving}
              style={{
                ...secondaryButtonStyle,
                ...(saving ? disabledButtonStyle : {}),
              }}
            >
              Flag core gift issue
            </button>
          )}
        </div>
      </div>

      {isGiftAidEnabled ? (
        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#1f2328' }}>Gift Aid in review</div>
          <div style={valueStyle}>
            {record.giftAidRequested ? 'Gift Aid requested' : 'Gift Aid not requested'}
          </div>
          <div style={secondaryTextStyle}>
            {record.giftAidDeclarationCaptured
              ? 'Declaration facts are present on the staging row and will be used at processing time.'
              : 'No declaration capture facts are attached to this row yet.'}
          </div>
          {record.giftAidRequested ? (
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              }}
            >
              <div>
                <div style={labelStyle}>Declaration captured</div>
                <div style={valueStyle}>
                  {record.giftAidDeclarationCaptured ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Declaration date</div>
                <div style={valueStyle}>
                  {record.giftAidDeclarationDate ?? 'Not recorded'}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Coverage scope</div>
                <div style={valueStyle}>
                  {record.giftAidCoverageScope || 'Not recorded'}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Source</div>
                <div style={valueStyle}>
                  {record.giftAidDeclarationSource || 'Not recorded'}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Text version</div>
                <div style={valueStyle}>
                  {record.giftAidTextVersion || 'Not recorded'}
                </div>
              </div>
            </div>
          ) : null}
          <div style={secondaryTextStyle}>
            {record.giftAidDeclarationId
              ? `Declaration link already resolved on staging: ${record.giftAidDeclarationId}`
              : 'Authoritative Gift Aid outcome still lands on the final gift, not on this staging row.'}
          </div>
        </div>
      ) : null}

      <div style={cardStyle}>
        <div style={{ ...labelStyle, color: '#1f2328' }}>Action framing</div>
        <div style={secondaryTextStyle}>
          The queue meaning above is now driven by donor evidence, real donor
          linkage, processing outcome, core gift issue, and explicit ready
          intent.
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => void handleMarkReady()}
            disabled={saving}
            style={{
              ...successButtonStyle,
              ...(saving ? disabledButtonStyle : {}),
            }}
          >
            {record.processingOutcome === 'FAILED'
              ? 'Ready after follow-up'
              : 'Mark ready'}
          </button>
          <button
            type="button"
            onClick={() => void returnToQueue()}
            disabled={saving}
            style={{
              ...secondaryButtonStyle,
              ...(saving ? disabledButtonStyle : {}),
            }}
          >
            Return to queue
          </button>
        </div>

        <div style={secondaryTextStyle}>
          {derived.hasBlocker
            ? 'A blocker still exists at the operational-model level, so this row should not honestly move forward until that fact changes.'
            : 'This row can move toward readiness once the reviewer explicitly decides it is ready.'}
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: STAGING_REVIEW_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'staging-review-record',
  description: 'Record review surface for the staging review workflow spike',
  component: ReviewCard,
});
