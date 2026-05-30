import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { buildDonationFormPreviewDocument } from 'src/donation-forms/donation-form-rendering';
import {
  labelStyle,
  panelStackStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  valueStyle,
} from 'src/front-components/gift-staging-review-ui';
import {
  buildPreviewConfig,
  deriveWorkspaceState,
  getPreviewAddressModeLabel,
  getPreviewDonationTypeOptions,
  normalizeConfig,
  panelStyle,
  previewControlGridStyle,
  previewFrameStyle,
  previewIframeStyle,
  previewStageStyle,
  previewSubtleCardStyle,
  type PreviewDonationType,
  useDonationFormRecord,
} from 'src/front-components/donation-form-workspace.shared';
import {
  getInputEventChecked,
} from 'src/manual-gift-entry/new-gift-support';

export const DONATION_FORM_PREVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'ebdb945d-16f3-4d12-87ca-29967ca8b11f';

type PreviewViewportMode = 'DESKTOP' | 'MOBILE';

const previewViewportButtonStyle = ({
  active,
}: {
  active: boolean;
}) => ({
  border: active ? '1px solid #0d7a5f' : '1px solid #d0d7de',
  background: active ? '#e9f6f2' : '#ffffff',
  color: active ? '#0d7a5f' : '#1f2328',
  borderRadius: '999px',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
});

const previewControlRowStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
};

const previewInlineGroupStyle = {
  display: 'grid',
  gap: '6px',
  minWidth: '0',
};

const previewHintStyle = {
  ...secondaryTextStyle,
  fontSize: '13px',
};

const DonationFormPreview = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useDonationFormRecord(recordId);
  const [previewDonationType, setPreviewDonationType] =
    useState<PreviewDonationType>('ONE_OFF');
  const [previewGiftAidSelected, setPreviewGiftAidSelected] = useState(false);
  const [previewViewportMode, setPreviewViewportMode] =
    useState<PreviewViewportMode>('DESKTOP');

  const savedDraftState = record ? deriveWorkspaceState(record) : null;

  useEffect(() => {
    if (!savedDraftState) {
      return;
    }

    const allowedTypes = getPreviewDonationTypeOptions(savedDraftState.mode);
    setPreviewDonationType((current) =>
      allowedTypes.includes(current) ? current : allowedTypes[0],
    );

    if (!savedDraftState.giftAidEnabled) {
      setPreviewGiftAidSelected(false);
    }
  }, [savedDraftState]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donation form preview…</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record || !savedDraftState) {
    return <div style={secondaryTextStyle}>Donation form not found.</div>;
  }

  const previewAmountOptions = (() => {
    try {
      return savedDraftState.amountOptionsText
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  })();
  const previewDonationTypeOptions = getPreviewDonationTypeOptions(
    savedDraftState.mode,
  );
  const previewSummaryLabel =
    previewDonationType === 'RECURRING'
      ? 'Monthly donation'
      : 'One-off donation';
  const previewPrimaryButtonLabel =
    previewDonationType === 'RECURRING'
      ? 'Continue to secure monthly payment'
      : 'Continue to secure payment';
  const previewViewportLabel =
    previewViewportMode === 'MOBILE'
      ? 'Mobile preview viewport'
      : 'Desktop preview viewport';
  const previewDocument = buildDonationFormPreviewDocument({
    config: buildPreviewConfig({
      currentConfig: normalizeConfig(record.config),
      state: savedDraftState,
    }),
    donationType: previewDonationType,
    giftAidRequested: previewGiftAidSelected,
  });

  return (
    <div style={panelStackStyle}>
      <div style={panelStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={labelStyle}>Saved draft preview</div>
            <div style={secondaryTextStyle}>
              This preview reflects the saved draft, not unsaved edits in
              Configure. Secure payment fields still appear only on the live
              form.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '14px',
          }}
        >
          <div style={previewControlRowStyle}>
            <div style={previewInlineGroupStyle}>
              <div style={labelStyle}>Preview donation type</div>
              {previewDonationTypeOptions.length > 1 ? (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap' as const,
                  }}
                >
                  {previewDonationTypeOptions.map((option) => {
                    const active = previewDonationType === option;
                    const label = option === 'RECURRING' ? 'Monthly' : 'One-off';

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPreviewDonationType(option)}
                        style={previewViewportButtonStyle({ active })}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={previewHintStyle}>{previewSummaryLabel}</div>
              )}
            </div>

            <div style={previewInlineGroupStyle}>
              <div style={labelStyle}>Preview viewport</div>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap' as const,
                }}
              >
                {([
                  ['DESKTOP', 'Desktop'],
                  ['MOBILE', 'Mobile'],
                ] as const).map(([mode, label]) => {
                  const active = previewViewportMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewViewportMode(mode)}
                      style={previewViewportButtonStyle({ active })}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {previewDonationTypeOptions.length > 1 ? (
            <div
              style={{
                ...previewSubtleCardStyle,
                padding: '10px 12px',
              }}
            >
              <div style={labelStyle}>Preview notes</div>
              <div style={previewControlGridStyle}>
                <div style={previewHintStyle}>
                  {previewAmountOptions.length > 0
                    ? `${previewAmountOptions.length} suggested amounts shown`
                    : 'No suggested amounts configured yet'}
                </div>
                <div style={previewHintStyle}>{previewViewportLabel}</div>
                <div style={previewHintStyle}>
                  {getPreviewAddressModeLabel({
                    requireAddress: savedDraftState.requireAddress,
                    giftAidEnabled: savedDraftState.giftAidEnabled,
                  })}
                </div>
                <div style={previewHintStyle}>
                  Primary action: {previewPrimaryButtonLabel}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                ...previewSubtleCardStyle,
                padding: '10px 12px',
              }}
            >
              <div style={labelStyle}>Preview notes</div>
              <div style={previewControlGridStyle}>
                <div style={previewHintStyle}>
                  {previewAmountOptions.length > 0
                    ? `${previewAmountOptions.length} suggested amounts shown`
                    : 'No suggested amounts configured yet'}
                </div>
                <div style={previewHintStyle}>{previewViewportLabel}</div>
                <div style={previewHintStyle}>
                  {getPreviewAddressModeLabel({
                    requireAddress: savedDraftState.requireAddress,
                    giftAidEnabled: savedDraftState.giftAidEnabled,
                  })}
                </div>
                <div style={previewHintStyle}>
                  Primary action: {previewPrimaryButtonLabel}
                </div>
              </div>
            </div>
          )}

          {savedDraftState.giftAidEnabled ? (
            <div
              style={{
                ...previewSubtleCardStyle,
                padding: '10px 12px',
              }}
            >
              <div style={labelStyle}>Gift Aid preview state</div>
              <label
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={previewGiftAidSelected}
                  onChange={(event) =>
                    setPreviewGiftAidSelected(getInputEventChecked(event))
                  }
                />
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ ...valueStyle, fontWeight: 600 }}>
                    Show the opted-in Gift Aid state
                  </div>
                  <div style={previewHintStyle}>
                    This toggles the shared preview between the default and Gift
                    Aid-selected address state.
                  </div>
                </div>
              </label>
            </div>
          ) : null}
        </div>

        <div style={previewStageStyle}>
          <div
            style={{
              ...previewFrameStyle,
              justifyItems: 'center',
            }}
          >
            <div
              style={{
                ...previewHintStyle,
                justifySelf: 'stretch',
                textAlign: 'center' as const,
              }}
            >
              Previewing the saved draft in a{' '}
              {previewViewportMode === 'MOBILE' ? 'mobile' : 'desktop'} frame.
            </div>
            <iframe
              title="Draft donation form preview"
              srcDoc={previewDocument}
              style={{
                ...previewIframeStyle,
                width: previewViewportMode === 'MOBILE' ? '390px' : '960px',
                maxWidth: '100%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    DONATION_FORM_PREVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'donation-form-preview',
  description:
    'Donation form preview surface showing the saved draft with shared rendering.',
  component: DonationFormPreview,
});
