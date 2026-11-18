import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { updateBatchGiftCoding } from 'src/batch-processing/batch-processing.api';
import { FormSelect } from 'src/front-components/form-controls';
import {
  ActionButton,
  SummaryStrip,
  SummaryStripItem,
  actionRowStyle,
  subtlePanelStyle,
} from 'src/front-components/front-component-ui';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import { getAppealIdForAppealSourceSelection } from 'src/gift-coding/gift-coding';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import type { GiftBatchWorkspaceSectionProps } from 'src/gift-batch-review/workspace/workspace-section';

const CONTROL_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  alignItems: 'end',
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

export const BatchCodingSection = ({
  recordId,
  record,
  onChanged,
}: GiftBatchWorkspaceSectionProps) => {
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
      appealSources.find(
        (appealSource) => appealSource.id === selectedAppealSourceId,
      ) ?? null,
    [appealSources, selectedAppealSourceId],
  );

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

      await onChanged();
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
      await onChanged();
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

      await onChanged();
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
    <WorkspaceSection
      title="Batch coding defaults"
      headerAction={
        <ActionButton
          title={isExpanded ? 'Close coding' : 'Open coding'}
          variant="secondary"
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
          disabled={isBusy || isOverWorkflowLimit || targetCount === 0}
        />
      }
    >
      <WorkspaceText color="primary">
        {isOverWorkflowLimit
          ? 'Split this batch before applying coding defaults.'
          : record.totalItems === 0
            ? 'No gifts have been added to this batch yet.'
            : targetCount === 0
              ? 'All gifts in this batch have already been processed.'
              : isExpanded
                ? 'Set shared coding defaults for this batch, then apply them to blank rows only.'
                : 'Shared coding defaults for this batch.'}
      </WorkspaceText>

      {!isOverWorkflowLimit && targetCount > 0 && !isExpanded ? (
        <SummaryStrip>
          <SummaryStripItem label="Appeal" value={appealSummary} />
          <SummaryStripItem label="Fund" value={fundSummary} />
          <SummaryStripItem label="Appeal source" value={appealSourceSummary} />
        </SummaryStrip>
      ) : null}

      {!isOverWorkflowLimit && targetCount > 0 && isExpanded ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={CONTROL_GRID_STYLE}>
            <FormSelect
              label="Appeal"
              value={selectedAppealId}
              onChange={handleAppealChange}
              emptyOptionLabel="No batch default"
              options={appeals.map((appeal) => ({
                value: appeal.id,
                label: appeal.name ?? 'Unnamed appeal',
              }))}
              disabled={isBusy || loadingAppeals}
              error={appealOptionsError}
            />
            <FormSelect
              label="Fund"
              value={selectedFundId}
              onChange={setSelectedFundId}
              emptyOptionLabel="No batch default"
              options={funds.map((fund) => ({
                value: fund.id,
                label: fund.name ?? 'Unnamed fund',
              }))}
              disabled={isBusy || loadingFunds}
              error={fundOptionsError}
            />
            <FormSelect
              label="Appeal source"
              value={selectedAppealSourceId}
              onChange={handleAppealSourceChange}
              emptyOptionLabel="No batch default"
              options={appealSources.map((appealSource) => ({
                value: appealSource.id,
                label: appealSource.name ?? 'Unnamed appeal source',
              }))}
              disabled={isBusy || loadingAppealSources}
              error={appealSourceOptionsError}
            />
          </div>

          {selectedAppeal?.defaultFund?.name ? (
            <div style={subtlePanelStyle}>
              <WorkspaceText>Appeal default fund</WorkspaceText>
              <WorkspaceText color="primary">
                {selectedAppeal.defaultFund.name}
              </WorkspaceText>
            </div>
          ) : null}

          <WorkspaceText>
            Applying defaults only fills blank appeal, fund, and appeal source
            fields on unprocessed gifts. It does not overwrite existing coding.
          </WorkspaceText>

          <div style={actionRowStyle}>
            <ActionButton
              title={savingDefaults ? 'Saving...' : 'Save defaults'}
              variant="secondary"
              onClick={() => {
                void handleSaveDefaults();
              }}
              disabled={!canSaveDefaults}
            />
            <ActionButton
              title={
                applyingDefaults ? 'Applying...' : 'Apply defaults to blank rows'
              }
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

      {!isExpanded &&
      (appealOptionsError || appealSourceOptionsError || fundOptionsError) ? (
        <>
          {appealOptionsError ? (
            <WorkspaceText>{appealOptionsError}</WorkspaceText>
          ) : null}
          {appealSourceOptionsError ? (
            <WorkspaceText>{appealSourceOptionsError}</WorkspaceText>
          ) : null}
          {fundOptionsError ? (
            <WorkspaceText>{fundOptionsError}</WorkspaceText>
          ) : null}
        </>
      ) : null}
    </WorkspaceSection>
  );
};
