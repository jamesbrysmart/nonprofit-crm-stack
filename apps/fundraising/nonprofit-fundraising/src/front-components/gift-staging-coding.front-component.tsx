import { useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  getAppealIdForAppealSourceSelection,
  getAppealSourceIdsForAppeal,
  getFundIdForAppealSelection,
} from 'src/gift-coding/gift-coding';
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
import {
  saveGiftCoding,
} from 'src/gift-staging-review/gift-staging-review.actions';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';

export const GIFT_STAGING_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ac717de2-3df8-4d25-9a84-9687c7ca081d';

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

const GiftStagingCoding = () => {
  const recordId = useRecordId();
  const { record, loading, error, refresh } = useGiftStagingReviewRecord(
    recordId,
  );
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

  useEffect(() => {
    if (!record || saving) {
      return;
    }

    setSelectedAppealId(record.appealId);
    setSelectedAppealSourceId(record.appealSourceId);
    setSelectedFundId(record.fundId);
  }, [record, saving]);

  const selectedAppeal = useMemo(
    () => appeals.find((appeal) => appeal.id === selectedAppealId) ?? null,
    [appeals, selectedAppealId],
  );

  if (loading) {
    return <div style={secondaryTextStyle}>Loading gift coding...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const isProcessed = record.processingStatus === 'PROCESSED';
  const hasUnsavedChanges =
    selectedAppealId !== record.appealId ||
    selectedAppealSourceId !== record.appealSourceId ||
    selectedFundId !== record.fundId;

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

    if (selectedAppealId === '' && nextAppealId !== '') {
      handleAppealChange(nextAppealId);
    }

    setSelectedAppealSourceId(nextAppealSourceId);
  };

  const handleSaveCoding = async () => {
    setSaving(true);

    try {
      await saveGiftCoding(recordId, {
        appealId: selectedAppealId,
        appealSourceId: selectedAppealSourceId,
        fundId: selectedFundId,
      });
      await enqueueSnackbar({
        message: 'Gift coding saved.',
        variant: 'success',
      });
      await refresh();
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save gift coding.',
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
          <span style={badgeStyle('neutral')}>Optional coding</span>
          {record.appealName !== '' ? (
            <span style={badgeStyle('success')}>Appeal set</span>
          ) : null}
          {record.appealSourceName !== '' ? (
            <span style={badgeStyle('success')}>Source set</span>
          ) : null}
          {record.fundName !== '' ? (
            <span style={badgeStyle('success')}>Fund set</span>
          ) : null}
        </div>
        <Button
          title="Save coding"
          variant="secondary"
          onClick={() => {
            void handleSaveCoding();
          }}
          disabled={
            saving ||
            isProcessed ||
            loadingAppeals ||
            loadingFunds ||
            !hasUnsavedChanges
          }
        />
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current appeal</div>
          <div style={secondaryTextStyle}>
            {record.appealName === '' ? 'No appeal set.' : record.appealName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current fund</div>
          <div style={secondaryTextStyle}>
            {record.fundName === '' ? 'No fund set.' : record.fundName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current appeal source</div>
          <div style={secondaryTextStyle}>
            {record.appealSourceName === ''
              ? 'No appeal source set.'
              : record.appealSourceName}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '10px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Appeal</span>
          <select
            style={inputStyle}
            value={selectedAppealId}
            onChange={(event) =>
              handleAppealChange(getInputEventValue(event))
            }
            disabled={saving || isProcessed || loadingAppeals}
          >
            <option value="">No appeal</option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.name ?? 'Unnamed appeal'}
              </option>
            ))}
          </select>
          {record.sourceAppealName !== '' ? (
            <span style={secondaryTextStyle}>
              Source: {record.sourceAppealName}
            </span>
          ) : null}
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Appeal source</span>
          <select
            style={inputStyle}
            value={selectedAppealSourceId}
            onChange={(event) =>
              handleAppealSourceChange(getInputEventValue(event))
            }
            disabled={saving || isProcessed || loadingAppealSources}
          >
            <option value="">No appeal source</option>
            {appealSources.map((appealSource) => (
              <option key={appealSource.id} value={appealSource.id}>
                {appealSource.name ?? 'Unnamed appeal source'}
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
            disabled={saving || isProcessed || loadingFunds}
          >
            <option value="">No fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name ?? 'Unnamed fund'}
              </option>
            ))}
          </select>
          {record.sourceFundName !== '' ? (
            <span style={secondaryTextStyle}>
              Source: {record.sourceFundName}
            </span>
          ) : null}
        </label>
      </div>

      {selectedAppeal?.defaultFund?.name ? (
        <div style={compactDividerSectionStyle}>
          <div style={labelStyle}>Appeal default fund</div>
          <div style={secondaryTextStyle}>
            {selectedAppeal.defaultFund.name}
            {selectedFundId === '' ? ' will be used if you leave Fund empty.' : ''}
          </div>
        </div>
      ) : null}

      {appealOptionsError ||
      appealSourceOptionsError ||
      fundOptionsError ||
      isProcessed ? (
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
          {isProcessed ? (
            <div style={secondaryTextStyle}>
              This staging row has already been processed. Update the committed gift if coding needs to change.
            </div>
          ) : null}
        </div>
      ) : null}

    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-coding',
  description:
    'Optional appeal and fund coding widget for staged gift review.',
  component: GiftStagingCoding,
});
