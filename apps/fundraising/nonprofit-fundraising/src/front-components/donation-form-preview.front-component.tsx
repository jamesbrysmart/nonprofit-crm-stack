import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { FormCheckbox } from 'src/front-components/form-controls';
import { theme } from 'src/front-components/theme-tokens';
import { buildDonationFormPreviewDocument } from 'src/donation-forms/donation-form-rendering';
import {
  labelStyle,
  panelStackStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import {
  buildPreviewConfig,
  deriveWorkspaceState,
  getPreviewAddressModeLabel,
  getPreviewDonationTypeOptions,
  normalizeConfig,
  panelStyle,
  previewFrameStyle,
  previewIframeStyle,
  previewStageStyle,
  previewSubtleCardStyle,
  type PreviewDonationType,
  useDonationFormRecord,
} from 'src/front-components/donation-form-workspace.shared';
import {
  DONATION_FORM_PREVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { useSingleSelectedRecordId } from 'src/front-components/use-single-selected-record-id';

type PreviewViewportMode = 'DESKTOP' | 'MOBILE';

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

const previewNotesRowStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap' as const,
};

const DonationFormPreview = () => {
  const recordId = useSingleSelectedRecordId();
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
      allowedTypes.includes(current) ? current : (allowedTypes[0] ?? current),
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
                      <Button
                        key={option}
                        size="sm"
                        variant={active ? 'solid' : 'outline'}
                        color={active ? 'accent' : 'neutral'}
                        aria-pressed={active}
                        onClick={() => setPreviewDonationType(option)}
                      >
                        {label}
                      </Button>
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
                    <Button
                      key={mode}
                      size="sm"
                      variant={active ? 'solid' : 'outline'}
                      color={active ? 'accent' : 'neutral'}
                      aria-pressed={active}
                      onClick={() => setPreviewViewportMode(mode)}
                    >
                      {label}
                    </Button>
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
              <div style={previewNotesRowStyle}>
                <Tag color="gray" variant="soft">
                  {previewAmountOptions.length > 0
                    ? `${previewAmountOptions.length} suggested amounts shown`
                    : 'No suggested amounts configured yet'}
                </Tag>
                <Tag color="gray" variant="soft">{previewViewportLabel}</Tag>
                <Tag color="gray" variant="soft">
                  {getPreviewAddressModeLabel({
                    requireAddress: savedDraftState.requireAddress,
                    giftAidEnabled: savedDraftState.giftAidEnabled,
                  })}
                </Tag>
                <Tag color="gray" variant="soft">
                  Primary action: {previewPrimaryButtonLabel}
                </Tag>
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
              <div style={previewNotesRowStyle}>
                <Tag color="gray" variant="soft">
                  {previewAmountOptions.length > 0
                    ? `${previewAmountOptions.length} suggested amounts shown`
                    : 'No suggested amounts configured yet'}
                </Tag>
                <Tag color="gray" variant="soft">{previewViewportLabel}</Tag>
                <Tag color="gray" variant="soft">
                  {getPreviewAddressModeLabel({
                    requireAddress: savedDraftState.requireAddress,
                    giftAidEnabled: savedDraftState.giftAidEnabled,
                  })}
                </Tag>
                <Tag color="gray" variant="soft">
                  Primary action: {previewPrimaryButtonLabel}
                </Tag>
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
              <FormCheckbox
                label="Show the opted-in Gift Aid state"
                checked={previewGiftAidSelected}
                onChange={setPreviewGiftAidSelected}
              />
              <div style={previewHintStyle}>
                This toggles the shared preview between the default and Gift
                Aid-selected address state.
              </div>
            </div>
          ) : null}
        </div>

        <div
          style={{
            ...previewStageStyle,
            border: '0',
            background: theme.background.secondary,
            padding: '12px 0 0',
            borderRadius: '0',
          }}
        >
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
