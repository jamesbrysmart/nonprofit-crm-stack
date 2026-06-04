import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import type {
  BatchGiftCodingAppealMode,
  BatchGiftCodingAppealSourceMode,
  BatchGiftCodingFundMode,
} from 'src/batch-processing/batch-processing.types';
import { updateBatchGiftCoding } from 'src/batch-processing/batch-processing.api';
import {
  badgeStyle,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  pillButtonStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/gift-staging-review-ui';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import {
  getAppealIdForAppealSourceSelection,
  getAppealSourceIdsForAppeal,
  getFundIdForAppealSelection,
} from 'src/gift-coding/gift-coding';

export const GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'df218c63-9ad9-4fc2-afca-cd120791befa';

type CompactCodingMode =
  | 'LEAVE_UNCHANGED'
  | 'CLEAR'
  | 'SET_ALL'
  | 'SET_WHERE_BLANK';

type FundSelectionMode = 'APPEAL_DEFAULT' | 'SPECIFIC_FUND';

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

const isSetMode = (mode: CompactCodingMode) =>
  mode === 'SET_ALL' || mode === 'SET_WHERE_BLANK';

const MODE_OPTIONS: Array<{
  mode: CompactCodingMode;
  label: string;
}> = [
  { mode: 'LEAVE_UNCHANGED', label: 'Leave' },
  { mode: 'CLEAR', label: 'Clear' },
  { mode: 'SET_ALL', label: 'Apply to all' },
  { mode: 'SET_WHERE_BLANK', label: 'Only where blank' },
];

const ruleListStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const ruleCardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const ruleHeaderStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
};

const modeButtonRowStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

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

const helperTextStyle: CSSProperties = {
  ...secondaryTextStyle,
  fontSize: '12px',
};

const ModeButton = ({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) => (
  <button
    type="button"
    style={{
      ...pillButtonStyle(selected),
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'default' : 'pointer',
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

const GiftBatchCoding = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);
  const [appealMode, setAppealMode] = useState<CompactCodingMode>('LEAVE_UNCHANGED');
  const [appealSourceMode, setAppealSourceMode] =
    useState<CompactCodingMode>('LEAVE_UNCHANGED');
  const [fundMode, setFundMode] = useState<CompactCodingMode>('LEAVE_UNCHANGED');
  const [fundSelectionMode, setFundSelectionMode] =
    useState<FundSelectionMode>('APPEAL_DEFAULT');
  const [selectedAppealId, setSelectedAppealId] = useState('');
  const [selectedAppealSourceId, setSelectedAppealSourceId] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [saving, setSaving] = useState(false);
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

  const selectedAppeal = useMemo(
    () => appeals.find((appeal) => appeal.id === selectedAppealId) ?? null,
    [appeals, selectedAppealId],
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
  const hasActionSelected =
    appealMode !== 'LEAVE_UNCHANGED' ||
    appealSourceMode !== 'LEAVE_UNCHANGED' ||
    fundMode !== 'LEAVE_UNCHANGED';
  const requiresAppealSelection =
    isSetMode(appealMode) || (isSetMode(fundMode) && fundSelectionMode === 'APPEAL_DEFAULT');
  const requiresAppealSourceSelection = isSetMode(appealSourceMode);
  const requiresFundSelection =
    isSetMode(fundMode) && fundSelectionMode === 'SPECIFIC_FUND';
  const isDisabled = saving || isOverWorkflowLimit || targetCount === 0;

  const isSaveDisabled =
    isDisabled ||
    loadingAppeals ||
    loadingAppealSources ||
    loadingFunds ||
    !hasActionSelected ||
    (requiresAppealSelection && selectedAppealId === '') ||
    (requiresAppealSourceSelection && selectedAppealSourceId === '') ||
    (requiresFundSelection && selectedFundId === '');

  const handleAppealChange = (nextAppealId: string) => {
    setSelectedAppealId(nextAppealId);
    setSelectedFundId(
      getFundIdForAppealSelection({
        appeals,
        nextAppealId,
        currentFundId: selectedFundId,
      }),
    );

    if (selectedAppealSourceId === '') {
      return;
    }

    const allowedSourceIds = getAppealSourceIdsForAppeal({
      appealSources,
      appealId: nextAppealId,
    });

    if (allowedSourceIds && !allowedSourceIds.has(selectedAppealSourceId)) {
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

  const mappedAppealMode = appealMode as BatchGiftCodingAppealMode;
  const mappedAppealSourceMode =
    appealSourceMode as BatchGiftCodingAppealSourceMode;
  const mappedFundMode: BatchGiftCodingFundMode =
    fundMode === 'LEAVE_UNCHANGED' || fundMode === 'CLEAR'
      ? fundMode
      : fundSelectionMode === 'APPEAL_DEFAULT'
        ? fundMode === 'SET_ALL'
          ? 'SET_APPEAL_DEFAULT_ALL'
          : 'SET_APPEAL_DEFAULT_WHERE_BLANK'
        : fundMode === 'SET_ALL'
          ? 'SET_ALL'
          : 'SET_WHERE_BLANK';

  const handleApplyCoding = async () => {
    setSaving(true);

    try {
      const result = await updateBatchGiftCoding({
        giftBatchId: recordId,
        appealMode: mappedAppealMode,
        selectedAppealId,
        appealSourceMode: mappedAppealSourceMode,
        selectedAppealSourceId,
        fundMode: mappedFundMode,
        selectedFundId,
      });

      await enqueueSnackbar({
        message: `Batch coding updated: ${result.updatedRowCount} gifts changed, ${result.appealUpdatedCount} appeal updates, ${result.appealSourceUpdatedCount} source updates, ${result.fundUpdatedCount} fund updates.`,
        variant: 'success',
      });

      broadcastGiftBatchInvalidated(recordId);
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to update gift coding for this batch.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={badgeStyle('neutral')}>Batch coding</span>
          {targetCount > 0 ? (
            <span style={badgeStyle('success')}>
              {targetCount} unprocessed {targetCount === 1 ? 'gift' : 'gifts'}
            </span>
          ) : null}
        </div>
        <Button
          title={saving ? 'Applying...' : 'Apply coding'}
          variant="secondary"
          onClick={() => {
            void handleApplyCoding();
          }}
          disabled={isSaveDisabled}
        />
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {isOverWorkflowLimit
          ? record.workflowLimitMessage
          : record.totalItems === 0
            ? 'No gifts have been added to this batch yet.'
            : targetCount === 0
            ? 'All gifts in this batch have already been processed.'
            : 'Update coding for unprocessed gifts in this batch.'}
      </div>

      {!isOverWorkflowLimit && targetCount > 0 ? (
        <div style={ruleListStyle}>
          <div style={ruleCardStyle}>
            <div style={ruleHeaderStyle}>
              <div style={labelStyle}>Appeal</div>
              <div style={helperTextStyle}>
                Choose the appeal you want to apply across this batch.
              </div>
            </div>
            <div style={modeButtonRowStyle}>
              {MODE_OPTIONS.map((option) => (
                <ModeButton
                  key={option.mode}
                  label={option.label}
                  selected={appealMode === option.mode}
                  onClick={() => setAppealMode(option.mode)}
                  disabled={isDisabled}
                />
              ))}
            </div>
            {isSetMode(appealMode) ? (
              <label style={inlineFieldStyle}>
                <span style={labelStyle}>Appeal</span>
                <select
                  style={inputStyle}
                  value={selectedAppealId}
                  onChange={(event) => handleAppealChange(getInputEventValue(event))}
                  disabled={isDisabled || loadingAppeals}
                >
                  <option value="">Select appeal</option>
                  {appeals.map((appeal) => (
                    <option key={appeal.id} value={appeal.id}>
                      {appeal.name ?? 'Unnamed appeal'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <div style={ruleCardStyle}>
            <div style={ruleHeaderStyle}>
              <div style={labelStyle}>Fund</div>
              <div style={helperTextStyle}>
                Use the appeal default fund or choose a specific fund.
              </div>
            </div>
            <div style={modeButtonRowStyle}>
              {MODE_OPTIONS.map((option) => (
                <ModeButton
                  key={option.mode}
                  label={option.label}
                  selected={fundMode === option.mode}
                  onClick={() => setFundMode(option.mode)}
                  disabled={isDisabled}
                />
              ))}
            </div>
            {isSetMode(fundMode) ? (
              <div style={controlGridStyle}>
                <label style={inlineFieldStyle}>
                  <span style={labelStyle}>Fund source</span>
                  <select
                    style={inputStyle}
                    value={fundSelectionMode}
                    onChange={(event) =>
                      setFundSelectionMode(
                        getInputEventValue(event) as FundSelectionMode,
                      )
                    }
                    disabled={isDisabled}
                  >
                    <option value="APPEAL_DEFAULT">Use appeal default</option>
                    <option value="SPECIFIC_FUND">Choose specific fund</option>
                  </select>
                </label>

                {fundSelectionMode === 'SPECIFIC_FUND' ? (
                  <label style={inlineFieldStyle}>
                    <span style={labelStyle}>Fund</span>
                    <select
                      style={inputStyle}
                      value={selectedFundId}
                      onChange={(event) => setSelectedFundId(getInputEventValue(event))}
                      disabled={isDisabled || loadingFunds}
                    >
                      <option value="">Select fund</option>
                      {funds.map((fund) => (
                        <option key={fund.id} value={fund.id}>
                          {fund.name ?? 'Unnamed fund'}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            ) : null}
            {isSetMode(fundMode) &&
            fundSelectionMode === 'APPEAL_DEFAULT' &&
            selectedAppeal?.defaultFund?.name ? (
              <div style={compactDividerSectionStyle}>
                <div style={labelStyle}>Appeal default fund</div>
                <div style={secondaryTextStyle}>
                  {selectedAppeal.defaultFund.name}
                </div>
              </div>
            ) : null}
          </div>

          <div style={ruleCardStyle}>
            <div style={ruleHeaderStyle}>
              <div style={labelStyle}>Appeal source</div>
              <div style={helperTextStyle}>
                This also keeps the appeal aligned with the selected source.
              </div>
            </div>
            <div style={modeButtonRowStyle}>
              {MODE_OPTIONS.map((option) => (
                <ModeButton
                  key={option.mode}
                  label={option.label}
                  selected={appealSourceMode === option.mode}
                  onClick={() => setAppealSourceMode(option.mode)}
                  disabled={isDisabled}
                />
              ))}
            </div>
            {isSetMode(appealSourceMode) ? (
              <label style={inlineFieldStyle}>
                <span style={labelStyle}>Appeal source</span>
                <select
                  style={inputStyle}
                  value={selectedAppealSourceId}
                  onChange={(event) =>
                    handleAppealSourceChange(getInputEventValue(event))
                  }
                  disabled={isDisabled || loadingAppealSources}
                >
                  <option value="">Select appeal source</option>
                  {appealSources.map((appealSource) => (
                    <option key={appealSource.id} value={appealSource.id}>
                      {appealSource.name ?? 'Unnamed appeal source'}
                    </option>
                  ))}
                </select>
              </label>
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
    'Compact batch coding controls for appeal, fund, and appeal source.',
  component: GiftBatchCoding,
});
