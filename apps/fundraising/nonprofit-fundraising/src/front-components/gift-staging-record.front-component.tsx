import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { Button } from 'twenty-sdk/ui';
import { checkDonorDuplicates } from 'src/manual-gift-entry/manual-gift-entry.api';
import {
  clearCoreGiftIssue,
  flagCoreGiftIssue,
  leaveUnresolved,
  linkDonor,
  markReady,
  saveGiftDate,
} from 'src/gift-staging-review/gift-staging-review.actions';
import {
  buildGiftStagingReviewRecord,
  buildPersonDisplayName,
  deriveReviewState,
} from 'src/gift-staging-review/gift-staging-review.model';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import type {
  GiftStagingReviewRecord,
  StoredGiftStagingRecord,
} from 'src/gift-staging-review/gift-staging-review.types';
import type { DuplicateCheckResponse } from 'src/manual-gift-entry/manual-gift-entry.types';

export const GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f5d9953c-1e4a-4113-8bd2-031b97731ab9';

const reviewStateCardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: '#ffffff',
};

const sectionCardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '16px',
  background: '#ffffff',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
  fontWeight: 500,
};

const valueStyle: CSSProperties = {
  fontSize: '15px',
  color: '#1f2328',
  lineHeight: 1.4,
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

const choiceButtonStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'left',
  background: '#ffffff',
  cursor: 'pointer',
  display: 'grid',
  gap: '4px',
};

const selectedChoiceButtonStyle: CSSProperties = {
  ...choiceButtonStyle,
  border: '1px solid #1f6feb',
  background: '#eef4ff',
};

const actionGroupStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

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

const loadStoredRecord = async (
  recordId: string,
): Promise<StoredGiftStagingRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      intakeSource: true,
      amount: true,
      giftDate: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
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
      hasCoreGiftIssue: true,
      isReadyForProcessing: true,
      processingStatus: true,
      errorDetail: true,
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: true,
      giftAidCoverageScope: true,
      giftAidDeclarationSource: true,
      giftAidTextVersion: true,
      giftAidDeclaration: {
        id: true,
      },
      giftBatch: {
        id: true,
        name: true,
      },
      committedGift: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.giftStaging as StoredGiftStagingRecord | null) ?? null;
};

const GiftStagingRecord = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftStagingReviewRecord | null>(null);
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DuplicateCheckResponse | null>(null);
  const [giftDateInput, setGiftDateInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  const refresh = async () => {
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
      setSelectedDonorId(null);

      if (!loadedRecord) {
        setRecord(null);
        setError('Record not found');
        return;
      }

      const nextRecord = buildGiftStagingReviewRecord(loadedRecord);
      setRecord(nextRecord);
      setGiftDateInput(nextRecord.giftDate);
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
    void refresh();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading staging review...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const reviewState = deriveReviewState(record);

  const handleSaveGiftDate = async () => {
    setSaving(true);

    try {
      await saveGiftDate(recordId, giftDateInput);
      await enqueueSnackbar({
        message: 'Gift date saved.',
        variant: 'success',
      });
      await refresh();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save gift date.',
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
        donorFirstName: record.donorFirstName,
        donorLastName: record.donorLastName,
      });
      setDuplicateCheckResult(result);

      await enqueueSnackbar({
        message:
          result.status === 'NO_MATCH'
            ? 'No exact donor duplicates found.'
            : result.status === 'SINGLE_EXACT_MATCH'
              ? 'One exact donor match found.'
              : 'Multiple exact donor matches found.',
        variant: 'info',
      });
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
      await refresh();
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
      await refresh();
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

  const handleToggleCoreGiftIssue = async () => {
    setSaving(true);

    try {
      if (record.hasCoreGiftIssue) {
        await clearCoreGiftIssue(recordId);
        await enqueueSnackbar({
          message: 'Core gift issue cleared.',
          variant: 'success',
        });
      } else {
        await flagCoreGiftIssue(recordId);
        await enqueueSnackbar({
          message: 'Core gift issue flagged.',
          variant: 'success',
        });
      }

      await refresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to update core gift issue state.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReady = async () => {
    setSaving(true);

    try {
      await markReady(recordId);
      await enqueueSnackbar({
        message: 'Row marked ready for processing.',
        variant: 'success',
      });
      await refresh();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error
            ? actionError.message
            : 'Unable to mark row ready.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
        display: 'grid',
        gap: '20px',
      }}
    >
      <div
        style={{
          ...reviewStateCardStyle,
          border: `2px solid ${reviewState.accent}`,
          background: reviewState.background,
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#1f2328' }}>{reviewState.title}</div>
        <div style={{...secondaryTextStyle, fontWeight: 500}}>{reviewState.reason}</div>
        <div style={secondaryTextStyle}>{reviewState.nextAction}</div>
      </div>

      <div style={sectionCardStyle}>
        <div style={labelStyle}>Staged gift</div>
        <div style={{ fontSize: '20px', fontWeight: 600, color: '#1f2328' }}>{record.name}</div>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={valueStyle}>Source: {record.intakeSource}</div>
          <div style={valueStyle}>Amount: {record.amountDisplay}</div>
          <div style={valueStyle}>Batch: {record.giftBatchName}</div>
          <div style={valueStyle}>Committed gift: {record.committedGiftName}</div>
          <div style={valueStyle}>Processing status: {record.processingStatus}</div>
        </div>
      </div>

      <div style={sectionCardStyle}>
        <div style={labelStyle}>Core facts</div>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={valueStyle}>Donor evidence: {record.donorEvidenceName}</div>
          <div style={secondaryTextStyle}>
            Email: {record.donorEmail === '' ? 'No email captured' : record.donorEmail}
          </div>
        </div>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Gift date</span>
          <input
            style={inputStyle}
            type="date"
            value={giftDateInput}
            onChange={(event) => setGiftDateInput(getInputEventValue(event))}
          />
        </label>

        <div style={actionGroupStyle}>
          <Button
            title="Save gift date"
            variant="secondary"
            onClick={() => {
              void handleSaveGiftDate();
            }}
            disabled={saving}
          />
          <Button
            title={
              record.hasCoreGiftIssue
                ? 'Clear core gift issue'
                : 'Flag core gift issue'
            }
            variant="secondary"
            onClick={() => {
              void handleToggleCoreGiftIssue();
            }}
            disabled={saving}
          />
        </div>
        {record.errorDetail !== '' ? (
          <div style={{...secondaryTextStyle, color: '#d12424'}}>Last error: {record.errorDetail}</div>
        ) : null}
      </div>

      <div style={sectionCardStyle}>
        <div style={labelStyle}>Donor review</div>
        <div style={valueStyle}>
          Linked donor:{' '}
          {record.linkedDonorName === '' ? 'No donor linked' : record.linkedDonorName}
        </div>
        <div style={secondaryTextStyle}>
          Resolution state: {record.donorResolution}
        </div>

        <div style={actionGroupStyle}>
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

        {duplicateCheckResult ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={secondaryTextStyle}>
              {duplicateCheckResult.status === 'NO_MATCH'
                ? 'No exact donor matches found.'
                : duplicateCheckResult.status === 'SINGLE_EXACT_MATCH'
                  ? 'One exact donor match found. Choose whether to link it.'
                  : 'Multiple exact donor matches found. Choose the donor explicitly.'}
            </div>

            {duplicateCheckResult.candidates.map((candidate) => {
              const selected = candidate.id === selectedDonorId;

              return (
                <button
                  key={candidate.id}
                  type="button"
                  style={selected ? selectedChoiceButtonStyle : choiceButtonStyle}
                  onClick={() => setSelectedDonorId(candidate.id)}
                >
                  <strong>{buildPersonDisplayName(candidate)}</strong>
                  <span style={secondaryTextStyle}>
                    {candidate.emails?.primaryEmail ?? 'No primary email'}
                  </span>
                </button>
              );
            })}

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
          </div>
        ) : null}
      </div>

      {isGiftAidEnabled() ? (
        <div style={sectionCardStyle}>
          <div style={labelStyle}>Gift Aid in review</div>
          <div style={valueStyle}>
            {record.giftAidRequested
              ? 'Gift Aid requested'
              : 'Gift Aid not requested'}
          </div>
          <div style={secondaryTextStyle}>
            {record.giftAidDeclarationCaptured
              ? 'Declaration facts are present on the staging row and will be evaluated during processing.'
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
                  {record.giftAidDeclarationDate || 'Not recorded'}
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
            {record.giftAidDeclarationId !== ''
              ? `Declaration already resolved on staging: ${record.giftAidDeclarationId}`
              : 'Authoritative Gift Aid outcome still lands on the final gift, not on this staging row.'}
          </div>
        </div>
      ) : null}

      <div style={sectionCardStyle}>
        <div style={labelStyle}>Processing intent</div>
        <div style={secondaryTextStyle}>
          Ready means the row is reviewed enough to be processed later. This
          slice does not run processing yet; it establishes the review boundary.
        </div>
        <div style={{ marginTop: '12px' }}>
          <Button
            title="Mark ready"
            variant="primary"
            accent="blue"
            onClick={() => {
              void handleMarkReady();
            }}
            disabled={
              saving ||
              record.hasCoreGiftIssue ||
              !record.linkedDonor?.id
            }
          />
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-record-review',
  description:
    'Record-level review surface for staged gifts before processing.',
  component: GiftStagingRecord,
});
