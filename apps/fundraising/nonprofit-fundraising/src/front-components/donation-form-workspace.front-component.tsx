import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, } from 'twenty-sdk/front-component';
import {
  getAppealIdForAppealSourceSelection,
  getAppealSourceIdsForAppeal,
  getFundIdForAppealSelection,
} from 'src/gift-coding/gift-coding';
import {
  ActionButton,
  fieldGridStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  ToneStatus,
} from 'src/front-components/front-component-ui';
import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
} from 'src/front-components/form-controls';
import { theme } from 'src/front-components/theme-tokens';
import {
  buildUpdatedDraftConfig,
  compactSectionStyle,
  deriveWorkspaceState,
  normalizeConfig,
  panelStyle,
  saveDonationFormDraft,
  stableStringify,
  type DonationFormWorkspaceState,
  useDonationFormRecord,
} from 'src/front-components/donation-form-workspace.shared';
import { useGiftCodingOptions } from 'src/front-components/use-gift-coding-options';
import { getInputEventValue } from 'src/manual-gift-entry/new-gift-support';
import {
  DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { getCurrencyOptions } from 'src/manual-gift-entry/new-gift-support';
import { getReportingCurrencyCode } from 'src/reporting-currency/reporting-currency';
import { normalizeString } from 'src/utils/normalize-string';
import { useSingleSelectedRecordId } from 'src/front-components/use-single-selected-record-id';

const COLOUR_FIELD_STYLE: CSSProperties = {
  display: 'grid',
  gap: '8px',
  gridTemplateColumns: '64px minmax(0, 1fr)',
  alignItems: 'end',
};

const COLOUR_SWATCH_STYLE: CSSProperties = {
  width: '64px',
  height: '32px',
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  background: theme.background.primary,
  padding: '2px',
  cursor: 'pointer',
};

const DonationFormConfigure = () => {
  const recordId = useSingleSelectedRecordId();
  const { record, setRecord, loading, error } = useDonationFormRecord(recordId);
  const [state, setState] = useState<DonationFormWorkspaceState | null>(null);
  const [savedState, setSavedState] = useState<DonationFormWorkspaceState | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const selectedAppealId = state?.selectedAppealId ?? '';
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
    if (!record?.id) {
      setState(null);
      setSavedState(null);
      return;
    }

    const nextState = deriveWorkspaceState(record);
    setState(nextState);
    setSavedState(nextState);
  }, [record]);

  const hasUnsavedChanges =
    state && savedState
      ? stableStringify(state) !== stableStringify(savedState)
      : false;

  const stateBadge = hasUnsavedChanges
    ? { label: 'Unsaved draft changes', tone: 'warning' as const }
    : { label: 'Saved draft', tone: 'success' as const };

  const handleFieldChange = <K extends keyof DonationFormWorkspaceState>(
    field: K,
    value: DonationFormWorkspaceState[K],
  ) => {
    setState((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSaveDraft = async () => {
    if (!recordId || !record || !state) {
      return;
    }

    setSaving(true);

    try {
      const nextConfig = buildUpdatedDraftConfig({
        currentConfig: normalizeConfig(record.config),
        state,
        appeals,
        appealSources,
        funds,
      });

      await saveDonationFormDraft({
        recordId,
        name: normalizeString(state.internalName) || 'Donation form',
        config: nextConfig,
      });

      setRecord((current) =>
        current
          ? {
              ...current,
              name: normalizeString(state.internalName) || 'Donation form',
              config: nextConfig,
            }
          : current,
      );
      setSavedState(state);

      await enqueueSnackbar({
        message: 'Draft donation form settings saved.',
        variant: 'success',
      });
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to save donation form draft.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAppealChange = (nextAppealId: string) => {
    if (!state) {
      return;
    }

    const allowedSourceIds = getAppealSourceIdsForAppeal({
      appealSources,
      appealId: nextAppealId,
    });
    const nextAppealSourceId =
      state.selectedAppealSourceId !== '' &&
      allowedSourceIds &&
      !allowedSourceIds.has(state.selectedAppealSourceId)
        ? ''
        : state.selectedAppealSourceId;

    setState({
      ...state,
      selectedAppealId: nextAppealId,
      selectedAppealSourceId: nextAppealSourceId,
      selectedFundId: getFundIdForAppealSelection({
        appeals,
        nextAppealId,
        currentFundId: state.selectedFundId,
      }),
    });
  };

  const handleAppealSourceChange = (nextAppealSourceId: string) => {
    if (!state) {
      return;
    }

    const nextAppealId = getAppealIdForAppealSourceSelection({
      appealSources,
      nextAppealSourceId,
    });
    const resolvedAppealId =
      state.selectedAppealId === '' && nextAppealId !== ''
        ? nextAppealId
        : state.selectedAppealId;

    setState({
      ...state,
      selectedAppealSourceId: nextAppealSourceId,
      selectedAppealId: resolvedAppealId,
      selectedFundId:
        state.selectedAppealId === '' && nextAppealId !== ''
          ? getFundIdForAppealSelection({
              appeals,
              nextAppealId,
              currentFundId: state.selectedFundId,
            })
          : state.selectedFundId,
    });
  };

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donation form configuration…</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record || !state) {
    return <div style={secondaryTextStyle}>Donation form not found.</div>;
  }

  return (
    <div style={panelStyle}>
      <div style={sectionHeaderStyle}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <ToneStatus tone={stateBadge.tone}>{stateBadge.label}</ToneStatus>
          </div>
          <div style={secondaryTextStyle}>
            Edit the saved draft here. Preview and Publish use the saved draft, so
            save before reviewing other tabs.
          </div>
        </div>
        <ActionButton
          title={saving ? 'Saving draft…' : 'Save draft'}
          variant="secondary"
          onClick={() => {
            void handleSaveDraft();
          }}
          disabled={saving || !hasUnsavedChanges}
        />
      </div>

      <div style={compactSectionStyle}>
        <FormInput
          label="Internal name"
          value={state.internalName}
          onChange={(value) => handleFieldChange('internalName', value)}
        />
        <FormInput
          label="Donor-facing title"
          value={state.title}
          onChange={(value) => handleFieldChange('title', value)}
        />
        <FormTextarea
          label="Description"
          value={state.description}
          onChange={(value) => handleFieldChange('description', value)}
        />
        <FormTextarea
          label="Thank-you message"
          value={state.thankYouMessage}
          onChange={(value) => handleFieldChange('thankYouMessage', value)}
        />
        <div style={COLOUR_FIELD_STYLE}>
          {/* twenty-ui has no colour picker, so keep the native one, themed. */}
          <input
            type="color"
            aria-label="Primary colour picker"
            style={COLOUR_SWATCH_STYLE}
            value={state.primaryColor}
            onChange={(event) =>
              handleFieldChange('primaryColor', getInputEventValue(event))
            }
          />
          <FormInput
            label="Primary colour"
            value={state.primaryColor}
            onChange={(value) => handleFieldChange('primaryColor', value)}
            placeholder="#0d7a5f"
          />
        </div>
      </div>

      <div style={fieldGridStyle}>
        <FormSelect
          label="Donation types"
          value={state.mode}
          onChange={(value) =>
            handleFieldChange('mode', value as DonationFormWorkspaceState['mode'])
          }
          options={[
            { value: 'ONE_OFF', label: 'One-off only' },
            { value: 'ONE_OFF_AND_MONTHLY', label: 'One-off and monthly' },
            { value: 'RECURRING', label: 'Monthly only' },
          ]}
        />
        <FormSelect
          label="Currency"
          value={state.currencyCode}
          onChange={(value) => handleFieldChange('currencyCode', value)}
          options={[
            ...new Set([
              state.currencyCode,
              ...getCurrencyOptions(getReportingCurrencyCode()),
            ]),
          ].map((currency) => ({ value: currency, label: currency }))}
        />
        <FormInput
          label={`Suggested amounts (${state.currencyCode})`}
          value={state.amountOptionsText}
          onChange={(value) => handleFieldChange('amountOptionsText', value)}
          placeholder="10, 25, 50"
        />
        <FormInput
          label={`Minimum custom amount (${state.currencyCode})`}
          inputMode="decimal"
          value={state.minimumAmountText}
          onChange={(value) => handleFieldChange('minimumAmountText', value)}
          placeholder="5"
        />
      </div>

      <div style={fieldGridStyle}>
        <FormCheckbox
          label="Allow custom amount"
          checked={state.allowCustomAmount}
          onChange={(checked) => handleFieldChange('allowCustomAmount', checked)}
        />
        <FormCheckbox
          label="Enable Gift Aid"
          checked={state.giftAidEnabled}
          onChange={(checked) => handleFieldChange('giftAidEnabled', checked)}
        />
        <FormCheckbox
          label="Always require address"
          checked={state.requireAddress}
          onChange={(checked) => handleFieldChange('requireAddress', checked)}
        />
        <FormCheckbox
          label="Collect phone"
          checked={state.collectPhone}
          onChange={(checked) => handleFieldChange('collectPhone', checked)}
        />
      </div>

      {state.giftAidEnabled ? (
        <div style={compactSectionStyle}>
          <FormInput
            label="Gift Aid text version"
            value={state.giftAidTextVersion}
            onChange={(value) => handleFieldChange('giftAidTextVersion', value)}
            placeholder="ga-2026-05"
          />
        </div>
      ) : null}

      <div style={compactSectionStyle}>
        <div style={secondaryTextStyle}>
          Optional default coding. Leave these blank for a generic donation form,
          or set them for appeal- or source-specific forms.
        </div>
        <div style={fieldGridStyle}>
          <FormSelect
            label="Default appeal"
            value={state.selectedAppealId}
            onChange={handleAppealChange}
            emptyOptionLabel="No default appeal"
            options={appeals.map((appeal) => ({
              value: appeal.id,
              label: normalizeString(appeal.name) || 'Untitled appeal',
            }))}
          />
          <FormSelect
            label="Default appeal source"
            value={state.selectedAppealSourceId}
            onChange={handleAppealSourceChange}
            emptyOptionLabel="No default appeal source"
            options={appealSources.map((appealSource) => ({
              value: appealSource.id,
              label: normalizeString(appealSource.name) || 'Untitled source',
            }))}
          />
          <FormSelect
            label="Default fund"
            value={state.selectedFundId}
            onChange={(value) => handleFieldChange('selectedFundId', value)}
            emptyOptionLabel="No default fund"
            options={funds.map((fund) => ({
              value: fund.id,
              label: normalizeString(fund.name) || 'Untitled fund',
            }))}
          />
        </div>
        {loadingAppeals || loadingAppealSources || loadingFunds ? (
          <div style={secondaryTextStyle}>Loading appeal and fund options…</div>
        ) : null}
        {appealOptionsError || appealSourceOptionsError || fundOptionsError ? (
          <div style={secondaryTextStyle}>
            {appealOptionsError || appealSourceOptionsError || fundOptionsError}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'donation-form-configure',
  description:
    'Donation form draft configuration surface for editing the saved draft.',
  component: DonationFormConfigure,
});
