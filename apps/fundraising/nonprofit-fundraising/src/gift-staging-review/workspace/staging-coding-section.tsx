import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Status } from 'twenty-ui/primitives/data-display';
import { FormSelect } from 'src/front-components/form-controls';
import { ActionButton } from 'src/front-components/front-component-ui';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import {
  WorkspaceSection,
  WorkspaceText,
} from 'src/front-components/workspace-layout';
import {
  getAppealIdForAppealSourceSelection,
  getAppealSourceIdsForAppeal,
  getFundIdForAppealSelection,
} from 'src/gift-coding/gift-coding';
import { saveGiftCoding } from 'src/gift-staging-review/gift-staging-review.actions';
import type { GiftStagingWorkspaceSectionProps } from 'src/gift-staging-review/workspace/workspace-section';
import type { AppealSourceSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

const CODING_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
};

const STATUS_ROW_STYLE: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const normalizeString = (value: string | null | undefined, fallback = '') =>
  typeof value === 'string' ? value.trim() || fallback : fallback;

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

export const StagingCodingSection = ({
  recordId,
  record,
  onChanged,
}: GiftStagingWorkspaceSectionProps) => {
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
    if (saving) {
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
  const selectedAppealSource = useMemo(
    () =>
      appealSources.find(
        (appealSource) => appealSource.id === selectedAppealSourceId,
      ) ?? null,
    [appealSources, selectedAppealSourceId],
  );

  const isProcessed = record.processingStatus === 'PROCESSED';
  const derivedSoftCreditLabel = getDerivedSoftCreditLabel(selectedAppealSource);
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
      await onChanged();
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
    <WorkspaceSection
      title="Gift coding"
      headerAction={
        <ActionButton
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
      }
    >
      <div style={STATUS_ROW_STYLE}>
        <Status color="gray">Optional coding</Status>
        {record.appealName !== '' ? <Status color="green">Appeal set</Status> : null}
        {record.appealSourceName !== '' ? (
          <Status color="green">Source set</Status>
        ) : null}
        {record.fundName !== '' ? <Status color="green">Fund set</Status> : null}
      </div>

      <div style={CODING_GRID_STYLE}>
        <FormSelect
          label="Appeal"
          value={selectedAppealId}
          onChange={handleAppealChange}
          emptyOptionLabel="No appeal"
          options={appeals.map((appeal) => ({
            value: appeal.id,
            label: appeal.name ?? 'Unnamed appeal',
          }))}
          disabled={saving || isProcessed || loadingAppeals}
          error={appealOptionsError}
          description={
            record.sourceAppealName !== ''
              ? `Source: ${record.sourceAppealName}`
              : undefined
          }
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
          disabled={saving || isProcessed || loadingAppealSources}
          error={appealSourceOptionsError}
          description={
            record.appealSourceExternalId !== ''
              ? record.appealSourceId !== ''
                ? `Matched by external ID: ${record.appealSourceExternalId}`
                : `Unresolved external ID: ${record.appealSourceExternalId}`
              : undefined
          }
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
          disabled={saving || isProcessed || loadingFunds}
          error={fundOptionsError}
          description={
            record.sourceFundName !== ''
              ? `Source: ${record.sourceFundName}`
              : undefined
          }
        />
      </div>

      {selectedAppeal?.defaultFund?.name ? (
        <WorkspaceText>
          Appeal default fund: {selectedAppeal.defaultFund.name}
          {selectedFundId === '' ? ' will be used if you leave Fund empty.' : ''}
        </WorkspaceText>
      ) : null}

      {derivedSoftCreditLabel !== '' ? (
        <WorkspaceText>
          Soft credit: {derivedSoftCreditLabel}. Derived from the selected appeal
          source.
        </WorkspaceText>
      ) : null}

      {isProcessed ? (
        <WorkspaceText>
          This staging row has already been processed. Update the committed gift
          if coding needs to change.
        </WorkspaceText>
      ) : null}
    </WorkspaceSection>
  );
};
