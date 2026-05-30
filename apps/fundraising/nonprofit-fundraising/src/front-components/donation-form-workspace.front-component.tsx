import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  fieldGridStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  valueStyle,
} from 'src/front-components/gift-staging-review-ui';
import {
  buildUpdatedDraftConfig,
  compactSectionStyle,
  deriveWorkspaceState,
  normalizeConfig,
  normalizeString,
  panelStyle,
  saveDonationFormDraft,
  stableStringify,
  textareaStyle,
  type DonationFormWorkspaceState,
  useDonationFormRecord,
} from 'src/front-components/donation-form-workspace.shared';
import {
  getInputEventChecked,
  getInputEventValue,
} from 'src/manual-gift-entry/new-gift-support';

export const DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '2ebc286a-c1e1-4d1b-a9c2-870868777028';

const DonationFormConfigure = () => {
  const recordId = useRecordId();
  const { record, setRecord, loading, error } = useDonationFormRecord(recordId);
  const [state, setState] = useState<DonationFormWorkspaceState | null>(null);
  const [savedState, setSavedState] = useState<DonationFormWorkspaceState | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

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
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              background:
                stateBadge.tone === 'warning' ? '#fff3cd' : '#dcfce7',
              color: stateBadge.tone === 'warning' ? '#92400e' : '#166534',
            }}
          >
            {stateBadge.label}
          </div>
          <div style={secondaryTextStyle}>
            Edit the saved draft here. Preview and Publish use the saved draft, so
            save before reviewing other tabs.
          </div>
        </div>
        <Button
          title={saving ? 'Saving draft…' : 'Save draft'}
          variant="secondary"
          onClick={() => {
            void handleSaveDraft();
          }}
          disabled={saving || !hasUnsavedChanges}
        />
      </div>

      <div style={compactSectionStyle}>
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Internal name</span>
          <input
            style={inputStyle}
            value={state.internalName}
            onChange={(event) =>
              handleFieldChange('internalName', getInputEventValue(event))
            }
          />
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Donor-facing title</span>
          <input
            style={inputStyle}
            value={state.title}
            onChange={(event) =>
              handleFieldChange('title', getInputEventValue(event))
            }
          />
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Description</span>
          <textarea
            style={textareaStyle}
            value={state.description}
            onChange={(event) =>
              handleFieldChange('description', getInputEventValue(event))
            }
          />
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Thank-you message</span>
          <textarea
            style={textareaStyle}
            value={state.thankYouMessage}
            onChange={(event) =>
              handleFieldChange('thankYouMessage', getInputEventValue(event))
            }
          />
        </label>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Primary colour</span>
          <div
            style={{
              display: 'grid',
              gap: '8px',
              gridTemplateColumns: '64px minmax(0, 1fr)',
              alignItems: 'center',
            }}
          >
            <input
              type="color"
              style={{
                width: '64px',
                height: '40px',
                border: '1px solid #d0d7de',
                borderRadius: '8px',
                background: '#ffffff',
                padding: '4px',
                cursor: 'pointer',
              }}
              value={state.primaryColor}
              onChange={(event) =>
                handleFieldChange('primaryColor', getInputEventValue(event))
              }
            />
            <input
              style={inputStyle}
              value={state.primaryColor}
              onChange={(event) =>
                handleFieldChange('primaryColor', getInputEventValue(event))
              }
              placeholder="#0d7a5f"
            />
          </div>
        </label>
      </div>

      <div style={fieldGridStyle}>
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Donation types</span>
          <select
            style={inputStyle}
            value={state.mode}
            onChange={(event) =>
              handleFieldChange(
                'mode',
                getInputEventValue(
                  event,
                ) as DonationFormWorkspaceState['mode'],
              )
            }
          >
            <option value="ONE_OFF">One-off only</option>
            <option value="ONE_OFF_AND_MONTHLY">One-off and monthly</option>
            <option value="RECURRING">Monthly only</option>
          </select>
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Suggested amounts (GBP)</span>
          <input
            style={inputStyle}
            value={state.amountOptionsText}
            onChange={(event) =>
              handleFieldChange('amountOptionsText', getInputEventValue(event))
            }
            placeholder="10, 25, 50"
          />
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Minimum custom amount (GBP)</span>
          <input
            style={inputStyle}
            value={state.minimumAmountText}
            onChange={(event) =>
              handleFieldChange('minimumAmountText', getInputEventValue(event))
            }
            placeholder="5"
          />
        </label>

      </div>

      <div style={fieldGridStyle}>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={state.allowCustomAmount}
            onChange={(event) =>
              handleFieldChange('allowCustomAmount', getInputEventChecked(event))
            }
          />
          <span style={valueStyle}>Allow custom amount</span>
        </label>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={state.giftAidEnabled}
            onChange={(event) =>
              handleFieldChange('giftAidEnabled', getInputEventChecked(event))
            }
          />
          <span style={valueStyle}>Enable Gift Aid</span>
        </label>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={state.requireAddress}
            onChange={(event) =>
              handleFieldChange('requireAddress', getInputEventChecked(event))
            }
          />
          <span style={valueStyle}>Always require address</span>
        </label>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={state.collectPhone}
            onChange={(event) =>
              handleFieldChange('collectPhone', getInputEventChecked(event))
            }
          />
          <span style={valueStyle}>Collect phone</span>
        </label>
      </div>

      {state.giftAidEnabled ? (
        <div style={compactSectionStyle}>
          <label style={{ display: 'grid', gap: '4px' }}>
            <span style={labelStyle}>Gift Aid text version</span>
            <input
              style={inputStyle}
              value={state.giftAidTextVersion}
              onChange={(event) =>
                handleFieldChange('giftAidTextVersion', getInputEventValue(event))
              }
              placeholder="ga-2026-05"
            />
          </label>
        </div>
      ) : null}

      <div style={fieldGridStyle}>
        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Default appeal name</span>
          <input
            style={inputStyle}
            value={state.sourceAppealName}
            onChange={(event) =>
              handleFieldChange('sourceAppealName', getInputEventValue(event))
            }
          />
        </label>

        <label style={{ display: 'grid', gap: '4px' }}>
          <span style={labelStyle}>Default fund name</span>
          <input
            style={inputStyle}
            value={state.sourceFundName}
            onChange={(event) =>
              handleFieldChange('sourceFundName', getInputEventValue(event))
            }
          />
        </label>
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
