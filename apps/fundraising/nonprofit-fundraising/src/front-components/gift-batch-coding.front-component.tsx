import { useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import type {
  BatchGiftCodingAppealMode,
  BatchGiftCodingFundMode,
} from 'src/batch-processing/batch-processing.types';
import { updateBatchGiftCoding } from 'src/batch-processing/batch-processing.api';
import { MAX_GIFT_BATCH_ITEMS } from 'src/batch-processing/batch-processing.limits';
import {
  badgeStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/gift-staging-review-ui';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';
import {
  listAppealOptions,
  listFundOptions,
} from 'src/manual-gift-entry/manual-gift-entry.api';
import type {
  AppealSummary,
  FundSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

export const GIFT_BATCH_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'df218c63-9ad9-4fc2-afca-cd120791befa';

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

const APPEAL_SET_MODES: BatchGiftCodingAppealMode[] = [
  'SET_ALL',
  'SET_WHERE_BLANK',
];

const FUND_SET_MODES: BatchGiftCodingFundMode[] = ['SET_ALL', 'SET_WHERE_BLANK'];
const FUND_DEFAULT_MODES: BatchGiftCodingFundMode[] = [
  'SET_APPEAL_DEFAULT_ALL',
  'SET_APPEAL_DEFAULT_WHERE_BLANK',
];

const getAppealModeLabel = (mode: BatchGiftCodingAppealMode) => {
  switch (mode) {
    case 'LEAVE_UNCHANGED':
      return 'Leave unchanged';
    case 'CLEAR':
      return 'Clear appeal';
    case 'SET_ALL':
      return 'Set selected appeal for all targeted rows';
    case 'SET_WHERE_BLANK':
      return 'Set selected appeal only where blank';
  }
};

const getFundModeLabel = (mode: BatchGiftCodingFundMode) => {
  switch (mode) {
    case 'LEAVE_UNCHANGED':
      return 'Leave unchanged';
    case 'CLEAR':
      return 'Clear fund';
    case 'SET_ALL':
      return 'Set selected fund for all targeted rows';
    case 'SET_WHERE_BLANK':
      return 'Set selected fund only where blank';
    case 'SET_APPEAL_DEFAULT_ALL':
      return 'Use selected appeal default fund for all targeted rows';
    case 'SET_APPEAL_DEFAULT_WHERE_BLANK':
      return 'Use selected appeal default fund only where fund is blank';
  }
};

const GiftBatchCoding = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);
  const [appeals, setAppeals] = useState<AppealSummary[]>([]);
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [loadingAppeals, setLoadingAppeals] = useState(false);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [appealOptionsError, setAppealOptionsError] = useState<string | null>(
    null,
  );
  const [fundOptionsError, setFundOptionsError] = useState<string | null>(null);
  const [appealMode, setAppealMode] =
    useState<BatchGiftCodingAppealMode>('LEAVE_UNCHANGED');
  const [fundMode, setFundMode] =
    useState<BatchGiftCodingFundMode>('LEAVE_UNCHANGED');
  const [selectedAppealId, setSelectedAppealId] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingAppeals(true);
    setAppealOptionsError(null);

    void listAppealOptions()
      .then((result) => {
        if (!cancelled) {
          setAppeals(result.appeals);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setAppeals([]);
          setAppealOptionsError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load appeals.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAppeals(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingFunds(true);
    setFundOptionsError(null);

    void listFundOptions()
      .then((result) => {
        if (!cancelled) {
          setFunds(result.funds);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setFunds([]);
          setFundOptionsError(
            loadError instanceof Error ? loadError.message : 'Unable to load funds.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingFunds(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
  const requiresAppealSelection =
    APPEAL_SET_MODES.includes(appealMode) || FUND_DEFAULT_MODES.includes(fundMode);
  const requiresFundSelection = FUND_SET_MODES.includes(fundMode);
  const hasActionSelected =
    appealMode !== 'LEAVE_UNCHANGED' || fundMode !== 'LEAVE_UNCHANGED';

  const isSaveDisabled =
    saving ||
    loadingAppeals ||
    loadingFunds ||
    isOverWorkflowLimit ||
    targetCount === 0 ||
    !hasActionSelected ||
    (requiresAppealSelection && selectedAppealId === '') ||
    (requiresFundSelection && selectedFundId === '');

  const handleApplyCoding = async () => {
    setSaving(true);

    try {
      const result = await updateBatchGiftCoding({
        giftBatchId: recordId,
        appealMode,
        selectedAppealId,
        fundMode,
        selectedFundId,
      });

      await enqueueSnackbar({
        message: `Batch coding updated: ${result.updatedRowCount} rows changed, ${result.appealUpdatedCount} appeal updates, ${result.fundUpdatedCount} fund updates.`,
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
              {targetCount} unprocessed {targetCount === 1 ? 'row' : 'rows'}
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
          : 'Apply appeal and fund coding across unprocessed rows in this batch without affecting readiness.'}
      </div>
      <div style={secondaryTextStyle}>
        Pilot limit: maximum {MAX_GIFT_BATCH_ITEMS} donations per batch.
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Target rows</div>
          <div style={secondaryTextStyle}>
            {targetCount === 0
              ? 'No unprocessed rows left in this batch.'
              : `${targetCount} unprocessed rows will be considered.`}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Appeal blanks</div>
          <div style={secondaryTextStyle}>
            {record.uncodedAppealItems} targeted rows currently have no appeal.
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Fund blanks</div>
          <div style={secondaryTextStyle}>
            {record.uncodedFundItems} targeted rows currently have no fund.
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Appeal action</span>
          <select
            style={inputStyle}
            value={appealMode}
            onChange={(event) =>
              setAppealMode(
                getInputEventValue(event) as BatchGiftCodingAppealMode,
              )
            }
            disabled={saving || isOverWorkflowLimit || targetCount === 0}
          >
            {(
              [
                'LEAVE_UNCHANGED',
                'CLEAR',
                'SET_ALL',
                'SET_WHERE_BLANK',
              ] as BatchGiftCodingAppealMode[]
            ).map((mode) => (
              <option key={mode} value={mode}>
                {getAppealModeLabel(mode)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Appeal</span>
          <select
            style={inputStyle}
            value={selectedAppealId}
            onChange={(event) => setSelectedAppealId(getInputEventValue(event))}
            disabled={
              saving ||
              loadingAppeals ||
              !requiresAppealSelection ||
              isOverWorkflowLimit ||
              targetCount === 0
            }
          >
            <option value="">Select appeal</option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.name ?? 'Unnamed appeal'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Fund action</span>
          <select
            style={inputStyle}
            value={fundMode}
            onChange={(event) =>
              setFundMode(getInputEventValue(event) as BatchGiftCodingFundMode)
            }
            disabled={saving || isOverWorkflowLimit || targetCount === 0}
          >
            {(
              [
                'LEAVE_UNCHANGED',
                'CLEAR',
                'SET_ALL',
                'SET_WHERE_BLANK',
                'SET_APPEAL_DEFAULT_ALL',
                'SET_APPEAL_DEFAULT_WHERE_BLANK',
              ] as BatchGiftCodingFundMode[]
            ).map((mode) => (
              <option key={mode} value={mode}>
                {getFundModeLabel(mode)}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Fund</span>
          <select
            style={inputStyle}
            value={selectedFundId}
            onChange={(event) => setSelectedFundId(getInputEventValue(event))}
            disabled={
              saving ||
              loadingFunds ||
              !requiresFundSelection ||
              isOverWorkflowLimit ||
              targetCount === 0
            }
          >
            <option value="">Select fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name ?? 'Unnamed fund'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedAppeal?.defaultFund?.name &&
      FUND_DEFAULT_MODES.includes(fundMode) ? (
        <div style={compactDividerSectionStyle}>
          <div style={labelStyle}>Selected appeal default fund</div>
          <div style={secondaryTextStyle}>
            {selectedAppeal.defaultFund.name}
          </div>
        </div>
      ) : null}

      {appealOptionsError || fundOptionsError ? (
        <div style={compactDividerSectionStyle}>
          {appealOptionsError ? (
            <div style={secondaryTextStyle}>{appealOptionsError}</div>
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
    'Bulk appeal and fund coding controls for unprocessed staged gifts in a batch.',
  component: GiftBatchCoding,
});
