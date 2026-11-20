import { useEffect, useMemo, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { FormSelect } from 'src/front-components/form-controls';
import {
  ActionButton,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import {
  getAppealIdForAppealSourceSelection,
  getAppealSourceIdsForAppeal,
  getFundIdForAppealSelection,
} from 'src/gift-coding/gift-coding';
import { saveGiftCoding } from 'src/gift-record/gift-coding.api';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import { normalizeString } from 'src/utils/normalize-string';

type GiftCodingRecord = {
  id: string;
  appeal?: {
    id?: string | null;
    name?: string | null;
    defaultFund?: {
      id?: string | null;
      name?: string | null;
    } | null;
  } | null;
  appealSource?: {
    id?: string | null;
    name?: string | null;
  } | null;
  fund?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

const loadGiftCodingRecord = async (
  recordId: string,
): Promise<GiftCodingRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      appeal: {
        id: true,
        name: true,
        defaultFund: {
          id: true,
          name: true,
        },
      },
      appealSource: {
        id: true,
        name: true,
      },
      fund: {
        id: true,
        name: true,
      },
    },
  } as any);

  return (result?.gift as GiftCodingRecord | null) ?? null;
};

export const GiftCodingSection = ({
  recordId,
  reloadToken,
  onChanged,
}: {
  recordId: string;
  reloadToken: number;
  onChanged: () => void;
}) => {
  const [record, setRecord] = useState<GiftCodingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppealId, setSelectedAppealId] = useState('');
  const [selectedAppealSourceId, setSelectedAppealSourceId] = useState('');
  const [selectedFundId, setSelectedFundId] = useState('');
  const [editing, setEditing] = useState(false);
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
    const run = async () => {
      if (!recordId) {
        setError('No gift selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadGiftCodingRecord(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Gift not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load gift coding.',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  useEffect(() => {
    if (reloadToken === 0) {
      return;
    }

    void loadGiftCodingRecord(recordId).then((loaded) => {
      if (loaded) {
        setRecord(loaded);
      }
    });
  }, [recordId, reloadToken]);

  useEffect(() => {
    if (!record || saving) {
      return;
    }

    setSelectedAppealId(normalizeString(record.appeal?.id));
    setSelectedAppealSourceId(normalizeString(record.appealSource?.id));
    setSelectedFundId(normalizeString(record.fund?.id));
  }, [record, saving]);

  const selectedAppeal = useMemo(
    () => appeals.find((appeal) => appeal.id === selectedAppealId) ?? null,
    [appeals, selectedAppealId],
  );

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading coding corrections...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !recordId) {
    return <div style={secondaryTextStyle}>Gift not found.</div>;
  }

  const currentAppealId = normalizeString(record.appeal?.id);
  const currentAppealSourceId = normalizeString(record.appealSource?.id);
  const currentFundId = normalizeString(record.fund?.id);
  const hasUnsavedChanges =
    selectedAppealId !== currentAppealId ||
    selectedAppealSourceId !== currentAppealSourceId ||
    selectedFundId !== currentFundId;

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
      await saveGiftCoding({
        giftId: recordId,
        appealId: selectedAppealId,
        appealSourceId: selectedAppealSourceId,
        fundId: selectedFundId,
      });
      await enqueueSnackbar({
        message: 'Gift coding saved.',
        variant: 'success',
      });
      setEditing(false);
      onChanged();
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
        <div style={{ display: 'grid', gap: '4px' }}>
          <div style={secondaryTextStyle}>
            Use only to correct attribution after processing. Most coding should
            be resolved during gift staging.
          </div>
        </div>
        {editing ? (
          <ActionButton
            title="Cancel"
            variant="secondary"
            onClick={() => {
              setSelectedAppealId(currentAppealId);
              setSelectedAppealSourceId(currentAppealSourceId);
              setSelectedFundId(currentFundId);
              setEditing(false);
            }}
            disabled={saving}
          />
        ) : (
          <ActionButton
            title="Edit coding"
            variant="secondary"
            onClick={() => setEditing(true)}
          />
        )}
      </div>

      {editing ? (
        <div style={compactDividerSectionStyle}>
          <div
            style={{
              display: 'grid',
              gap: '10px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            <FormSelect
              label="Appeal"
              value={selectedAppealId}
              onChange={handleAppealChange}
              emptyOptionLabel="No appeal"
              options={appeals.map((appeal) => ({
                value: appeal.id,
                label: appeal.name ?? 'Unnamed appeal',
              }))}
              disabled={saving || loadingAppeals}
            />
            <FormSelect
              label="Fund"
              value={selectedFundId}
              onChange={setSelectedFundId}
              emptyOptionLabel="No fund"
              options={funds.map((fund) => ({
                value: fund.id,
                label: fund.name ?? 'Unnamed fund',
              }))}
              disabled={saving || loadingFunds}
            />
            <FormSelect
              label="Appeal source"
              value={selectedAppealSourceId}
              onChange={handleAppealSourceChange}
              emptyOptionLabel="No appeal source"
              options={appealSources.map((appealSource) => ({
                value: appealSource.id,
                label: appealSource.name ?? 'Unnamed appeal source',
              }))}
              disabled={saving || loadingAppealSources}
            />
          </div>

          {selectedAppeal?.defaultFund?.name ? (
            <div style={compactDividerSectionStyle}>
              <div style={labelStyle}>Appeal default fund</div>
              <div style={secondaryTextStyle}>
                {selectedAppeal.defaultFund.name}
                {selectedFundId === ''
                  ? ' will be used if you leave Fund empty.'
                  : ''}
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

          <div style={sectionHeaderStyle}>
            <div style={secondaryTextStyle}>
              Save only if the committed gift was coded incorrectly.
            </div>
            <ActionButton
              title="Save coding"
              variant="secondary"
              onClick={() => {
                void handleSaveCoding();
              }}
              disabled={
                saving ||
                loadingAppeals ||
                loadingFunds ||
                !hasUnsavedChanges
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
