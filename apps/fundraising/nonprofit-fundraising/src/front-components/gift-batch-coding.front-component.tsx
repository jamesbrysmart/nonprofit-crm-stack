import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { updateBatchGiftCoding } from 'src/batch-processing/batch-processing.api';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  subtlePanelStyle,
} from 'src/front-components/front-component-ui';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import { getAppealIdForAppealSourceSelection } from 'src/gift-coding/gift-coding';

export const GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'df218c63-9ad9-4fc2-afca-cd120791befa';

const controlGridStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  alignItems: 'end',
};

const inlineFieldStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
};

const summaryValueStyle: CSSProperties = {
  color: '#1f2328',
  fontSize: '13px',
  lineHeight: 1.4,
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

  if (
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    typeof event.target === 'object' &&
    event.target !== null &&
    'value' in event.target
  ) {
    return String((event.target as { value?: unknown }).value ?? '');
  }

  return '';
};

const saveBatchCodingDefaults = async ({
  recordId,
  defaultAppealId,
  defaultFundId,
  defaultAppealSourceId,
}: {
  recordId: string;
  defaultAppealId: string;
  defaultFundId: string;
  defaultAppealSourceId: string;
}) => {
  const client = new CoreApiClient();

  await client.mutation({
    updateGiftBatch: {
      __args: {
        id: recordId,
        data: {
          ...(defaultAppealId !== ''
            ? {
                defaultAppeal: {
                  connect: {
                    where: {
                      id: defaultAppealId,
                    },
                  },
                },
              }
            : {
                defaultAppealId: null,
              }),
          ...(defaultFundId !== ''
            ? {
                defaultFund: {
                  connect: {
                    where: {
                      id: defaultFundId,
                    },
                  },
                },
              }
            : {
                defaultFundId: null,
              }),
          ...(defaultAppealSourceId !== ''
            ? {
                defaultAppealSource: {
                  connect: {
                    where: {
                      id: defaultAppealSourceId,
                    },
                  },
                },
              }
            : {
                defaultAppealSourceId: null,
              }),
        },
      },
      id: true,
    },
  } as any);
};

const GiftBatchCoding = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState('');
  const [selectedAppealSourceId, setSelectedAppealSourceId] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [applyingDefaults, setApplyingDefaults] = useState(false);
  const {
    appeals,
    appealSources,
    funds,
    loadingAppeals,
    loadingAppealSources,
    loadingFunds,
    appealOptionsError,
    appealSourceOptionsError,
    fundOptionsError,
  } = useGiftCodingOptions({ selectedAppealId });

  useEffect(() => {
    if (!record) {
      return;
    }

    setSelectedAppealId(record.defaultAppealId);
    setSelectedFundId(record.defaultFundId);
    setSelectedAppealSourceId(record.defaultAppealSourceId);
  }, [record]);

  const selectedAppeal = useMemo(
    () => appeals.find((appeal) => appeal.id === selectedAppealId) ?? null,
    [appeals, selectedAppealId],
  );

  const selectedFund = useMemo(
    () => funds.find((fund) => fund.id === selectedFundId) ?? null,
    [funds, selectedFundId],
  );

  const selectedAppealSource = useMemo(
    () =>
      appealSources.find((appealSource) => appealSource.id === selectedAppealSourceId) ??
      null,
    [appealSources, selectedAppealSourceId],
  );

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading batch coding...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const isOverWorkflowLimit = record.isOverWorkflowLimit;
  const targetCount = record.unprocessedItems;
  const hasDefaults =
    record.defaultAppealId !== '' ||
    record.defaultFundId !== '' ||
    record.defaultAppealSourceId !== '';
  const hasDraftDefaults =
    selectedAppealId !== '' || selectedFundId !== '' || selectedAppealSourceId !== '';
  const hasUnsavedChanges =
    selectedAppealId !== record.defaultAppealId ||
    selectedFundId !== record.defaultFundId ||
    selectedAppealSourceId !== record.defaultAppealSourceId;
  const isBusy = savingDefaults || applyingDefaults;
  const isDisabled = isBusy || isOverWorkflowLimit || targetCount === 0;
  const canApplyDefaults = !isDisabled && hasDraftDefaults;
  const canSaveDefaults = !isBusy && hasUnsavedChanges;
  const canRemoveDefaults = !isBusy && hasDefaults;

  const appealSummary =
    selectedAppeal?.name ??
    (record.defaultAppealName || 'No batch default');
  const fundSummary =
    selectedFund?.name ??
    (record.defaultFundName || 'No batch default');
  const appealSourceSummary =
    selectedAppealSource?.name ??
    (record.defaultAppealSourceName || 'No batch default');

  const handleAppealChange = (nextAppealId: string) => {
    setSelectedAppealId(nextAppealId);

    const nextAppeal =
      appeals.find((appeal) => appeal.id === nextAppealId) ?? null;
    const nextDefaultFundId = nextAppeal?.defaultFund?.id?.trim() ?? '';
    setSelectedFundId(nextDefaultFundId);

    if (selectedAppealSourceId === '') {
      return;
    }

    const currentSourceAppealId = getAppealIdForAppealSourceSelection({
      appealSources,
      nextAppealSourceId: selectedAppealSourceId,
    });

    if (currentSourceAppealId !== '' && currentSourceAppealId !== nextAppealId) {
      setSelectedAppealSourceId('');
    }
  };

  const handleAppealSourceChange = (nextAppealSourceId: string) => {
    const nextAppealId = getAppealIdForAppealSourceSelection({
      appealSources,
      nextAppealSourceId,
    });

    if (nextAppealId !== '' && nextAppealId !== selectedAppealId) {
      handleAppealChange(nextAppealId);
    }

    setSelectedAppealSourceId(nextAppealSourceId);
  };

  const handleSaveDefaults = async () => {
    setSavingDefaults(true);

    try {
      await saveBatchCodingDefaults({
        recordId,
        defaultAppealId: selectedAppealId,
        defaultFundId: selectedFundId,
        defaultAppealSourceId: selectedAppealSourceId,
      });

      await enqueueSnackbar({
        message: 'Batch coding defaults saved.',
        variant: 'success',
      });

      broadcastGiftBatchInvalidated(recordId);
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save batch coding defaults.',
        variant: 'error',
      });
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleApplyDefaults = async () => {
    setApplyingDefaults(true);

    try {
      const result = await updateBatchGiftCoding({
        giftBatchId: recordId,
        defaultAppealId: selectedAppealId,
        defaultFundId: selectedFundId,
        defaultAppealSourceId: selectedAppealSourceId,
      });

      await enqueueSnackbar({
        message:
          result.rowUpdateMessage ??
          `Batch coding applied: ${result.updatedRowCount} gifts updated across blank coding fields.`,
        variant: result.rowUpdatesApplied ? 'success' : 'warning',
      });

      setIsExpanded(false);
      broadcastGiftBatchInvalidated(recordId);
    } catch (applyError) {
      await enqueueSnackbar({
        message:
          applyError instanceof Error
            ? applyError.message
            : 'Unable to apply batch coding defaults.',
        variant: 'error',
      });
    } finally {
      setApplyingDefaults(false);
    }
  };

  const handleRemoveDefaults = async () => {
    setSavingDefaults(true);

    try {
      await saveBatchCodingDefaults({
        recordId,
        defaultAppealId: '',
        defaultFundId: '',
        defaultAppealSourceId: '',
      });

      setSelectedAppealId('');
      setSelectedFundId('');
      setSelectedAppealSourceId('');

      await enqueueSnackbar({
        message:
          'Batch coding defaults removed. This does not change coding already applied to gifts.',
        variant: 'success',
      });

      broadcastGiftBatchInvalidated(recordId);
    } catch (removeError) {
      await enqueueSnackbar({
        message:
          removeError instanceof Error
            ? removeError.message
            : 'Unable to remove batch coding defaults.',
        variant: 'error',
      });
    } finally {
      setSavingDefaults(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={labelStyle}>Batch coding defaults</div>
        <ActionButton
          title={isExpanded ? 'Close coding' : 'Open coding'}
          variant="secondary"
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
          disabled={isBusy || isOverWorkflowLimit || targetCount === 0}
        />
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {isOverWorkflowLimit
          ? 'Split this batch before applying coding defaults.'
          : record.totalItems === 0
            ? 'No gifts have been added to this batch yet.'
            : targetCount === 0
              ? 'All gifts in this batch have already been processed.'
              : isExpanded
                ? 'Set shared coding defaults for this batch, then apply them to blank rows only.'
                : 'Shared coding defaults for this batch.'}
      </div>

      {!isOverWorkflowLimit && targetCount > 0 && !isExpanded ? (
        <SummaryStrip>
          <SummaryStripItem label="Appeal">
            <div style={summaryValueStyle}>{appealSummary}</div>
          </SummaryStripItem>
          <SummaryStripItem label="Fund">
            <div style={summaryValueStyle}>{fundSummary}</div>
          </SummaryStripItem>
          <SummaryStripItem label="Appeal source">
            <div style={summaryValueStyle}>{appealSourceSummary}</div>
          </SummaryStripItem>
        </SummaryStrip>
      ) : null}

      {!isOverWorkflowLimit && targetCount > 0 && isExpanded ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={controlGridStyle}>
            <label style={inlineFieldStyle}>
              <span style={labelStyle}>Appeal</span>
              <select
                style={inputStyle}
                value={selectedAppealId}
                onChange={(event) => handleAppealChange(getInputEventValue(event))}
                disabled={isBusy || loadingAppeals}
              >
                <option value="">No batch default</option>
                {appeals.map((appeal) => (
                  <option key={appeal.id} value={appeal.id}>
                    {appeal.name ?? 'Unnamed appeal'}
                  </option>
                ))}
              </select>
            </label>

            <label style={inlineFieldStyle}>
              <span style={labelStyle}>Fund</span>
              <select
                style={inputStyle}
                value={selectedFundId}
                onChange={(event) => setSelectedFundId(getInputEventValue(event))}
                disabled={isBusy || loadingFunds}
              >
                <option value="">No batch default</option>
                {funds.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name ?? 'Unnamed fund'}
                  </option>
                ))}
              </select>
            </label>

            <label style={inlineFieldStyle}>
              <span style={labelStyle}>Appeal source</span>
              <select
                style={inputStyle}
                value={selectedAppealSourceId}
                onChange={(event) =>
                  handleAppealSourceChange(getInputEventValue(event))
                }
                disabled={isBusy || loadingAppealSources}
              >
                <option value="">No batch default</option>
                {appealSources.map((appealSource) => (
                  <option key={appealSource.id} value={appealSource.id}>
                    {appealSource.name ?? 'Unnamed appeal source'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedAppeal?.defaultFund?.name ? (
            <div style={subtlePanelStyle}>
              <div style={labelStyle}>Appeal default fund</div>
              <div style={secondaryTextStyle}>
                {selectedAppeal.defaultFund.name}
              </div>
            </div>
          ) : null}

          <div style={compactDividerSectionStyle}>
            <div style={secondaryTextStyle}>
              Applying defaults only fills blank appeal, fund, and appeal source
              fields on unprocessed gifts. It does not overwrite existing coding.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ActionButton
              title={savingDefaults ? 'Saving...' : 'Save defaults'}
              variant="secondary"
              onClick={() => {
                void handleSaveDefaults();
              }}
              disabled={!canSaveDefaults}
            />
            <ActionButton
              title={applyingDefaults ? 'Applying...' : 'Apply defaults to blank rows'}
              variant="primary"
              accent="blue"
              onClick={() => {
                void handleApplyDefaults();
              }}
              disabled={!canApplyDefaults}
            />
            {hasDefaults ? (
              <ActionButton
                title="Remove batch defaults"
                variant="secondary"
                onClick={() => {
                  void handleRemoveDefaults();
                }}
                disabled={!canRemoveDefaults}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {appealOptionsError || appealSourceOptionsError || fundOptionsError ? (
        <div style={compactDividerSectionStyle}>
          {appealOptionsError ? (
            <div style={secondaryTextStyle}>{appealOptionsError}</div>
          ) : null}
          {appealSourceOptionsError ? (
            <div style={secondaryTextStyle}>{appealSourceOptionsError}</div>
          ) : null}
          {fundOptionsError ? (
            <div style={secondaryTextStyle}>{fundOptionsError}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-coding',
  description:
    'Batch coding defaults for appeal, fund, and appeal source.',
  component: GiftBatchCoding,
});
