import { useEffect, useMemo, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import {
  ActionButton,
  badgeStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  inputStyle,
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
import { subscribeToGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import type { AppealSourceSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

export const GIFT_RECORD_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '93dc8e25-d8c5-4d41-b43b-f72bf23f1e13';

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
  softCreditPerson?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    emails?: {
      primaryEmail?: string | null;
    } | null;
  } | null;
  softCreditCompany?: {
    id?: string | null;
    name?: string | null;
  } | null;
  softCreditType?: string | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

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

const buildPersonDisplayName = (
  person: AppealSourceSummary['fundraiserPerson'],
) => {
  if (!person) {
    return '';
  }

  const firstName = normalizeString(person.name?.firstName);
  const lastName = normalizeString(person.name?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName !== '') {
    return fullName;
  }

  return normalizeString(person.emails?.primaryEmail);
};

const getDerivedSoftCreditLabel = (
  appealSource: AppealSourceSummary | null,
) => {
  if (!appealSource) {
    return '';
  }

  const fundraiserPersonName = buildPersonDisplayName(
    appealSource.fundraiserPerson,
  );

  if (fundraiserPersonName !== '') {
    return `Fundraiser: ${fundraiserPersonName}`;
  }

  const fundraiserCompanyName = normalizeString(
    appealSource.fundraiserCompany?.name,
  );

  if (fundraiserCompanyName !== '') {
    return `Fundraiser: ${fundraiserCompanyName}`;
  }

  return '';
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
      softCreditPerson: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
      },
      softCreditCompany: {
        id: true,
        name: true,
      },
      softCreditType: true,
    },
  } as any);

  return (result?.gift as GiftCodingRecord | null) ?? null;
};

const GiftRecordCoding = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftCodingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    if (!recordId) {
      return;
    }

    return subscribeToGiftRecordInvalidated({
      recordId,
      onInvalidate: async () => {
        const loaded = await loadGiftCodingRecord(recordId);

        if (!loaded) {
          return;
        }

        setRecord(loaded);
      },
    });
  }, [recordId]);

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
  const selectedAppealSource = useMemo(
    () =>
      appealSources.find(
        (appealSource) => appealSource.id === selectedAppealSourceId,
      ) ?? null,
    [appealSources, selectedAppealSourceId],
  );

  if (loading) {
    return <div style={secondaryTextStyle}>Loading gift coding...</div>;
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
  const currentAppealName = normalizeString(record.appeal?.name);
  const currentAppealSourceName = normalizeString(record.appealSource?.name);
  const currentFundName = normalizeString(record.fund?.name);
  const currentSoftCreditPersonName = buildPersonDisplayName(
    record.softCreditPerson,
  );
  const currentSoftCreditCompanyName = normalizeString(
    record.softCreditCompany?.name,
  );
  const currentSoftCreditLabel =
    currentSoftCreditPersonName !== ''
      ? `Fundraiser: ${currentSoftCreditPersonName}`
      : currentSoftCreditCompanyName !== ''
        ? `Fundraiser: ${currentSoftCreditCompanyName}`
        : '';
  const derivedSoftCreditLabel = getDerivedSoftCreditLabel(selectedAppealSource);
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
          <span style={badgeStyle('neutral')}>Canonical coding</span>
          {currentAppealName !== '' ? (
            <span style={badgeStyle('success')}>Appeal set</span>
          ) : null}
          {currentAppealSourceName !== '' ? (
            <span style={badgeStyle('success')}>Source set</span>
          ) : null}
          {currentFundName !== '' ? (
            <span style={badgeStyle('success')}>Fund set</span>
          ) : null}
        </div>
        <ActionButton
          title="Save coding"
          variant="secondary"
          onClick={() => {
            void handleSaveCoding();
          }}
          disabled={saving || loadingAppeals || loadingFunds || !hasUnsavedChanges}
        />
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current appeal</div>
          <div style={secondaryTextStyle}>
            {currentAppealName === '' ? 'No appeal set.' : currentAppealName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current fund</div>
          <div style={secondaryTextStyle}>
            {currentFundName === '' ? 'No fund set.' : currentFundName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current appeal source</div>
          <div style={secondaryTextStyle}>
            {currentAppealSourceName === ''
              ? 'No appeal source set.'
              : currentAppealSourceName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Current soft credit</div>
          <div style={secondaryTextStyle}>
            {currentSoftCreditLabel === ''
              ? 'No soft credit set.'
              : currentSoftCreditLabel}
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
            onChange={(event) => handleAppealChange(getInputEventValue(event))}
            disabled={saving || loadingAppeals}
          >
            <option value="">No appeal</option>
            {appeals.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.name ?? 'Unnamed appeal'}
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
            disabled={saving || loadingFunds}
          >
            <option value="">No fund</option>
            {funds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name ?? 'Unnamed fund'}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Appeal source</span>
          <select
            style={inputStyle}
            value={selectedAppealSourceId}
            onChange={(event) =>
              handleAppealSourceChange(getInputEventValue(event))
            }
            disabled={saving || loadingAppealSources}
          >
            <option value="">No appeal source</option>
            {appealSources.map((appealSource) => (
              <option key={appealSource.id} value={appealSource.id}>
                {appealSource.name ?? 'Unnamed appeal source'}
              </option>
            ))}
          </select>
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

      <div style={compactDividerSectionStyle}>
        <div style={labelStyle}>Soft credit</div>
        <div style={secondaryTextStyle}>
          {derivedSoftCreditLabel !== ''
            ? `${derivedSoftCreditLabel}. Derived from the selected appeal source.`
            : selectedAppealSourceId !== ''
              ? 'No fundraiser soft credit will be derived from the selected appeal source.'
              : 'Select an appeal source with a linked fundraiser to derive soft credit.'}
        </div>
      </div>

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
  universalIdentifier: GIFT_RECORD_CODING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-record-coding',
  description: 'Optional appeal and fund coding widget for committed gifts.',
  component: GiftRecordCoding,
});
