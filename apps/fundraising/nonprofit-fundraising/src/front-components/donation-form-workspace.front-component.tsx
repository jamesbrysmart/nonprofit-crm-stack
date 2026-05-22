import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { publishDonationForm } from 'src/donation-forms/donation-form-publish.api';
import {
  actionRowStyle,
  badgeStyle,
  cardStyle,
  fieldGridStyle,
  inputStyle,
  labelStyle,
  panelStackStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  valueStyle,
} from 'src/front-components/gift-staging-review-ui';
import {
  getInputEventChecked,
  getInputEventValue,
} from 'src/manual-gift-entry/new-gift-support';

export const DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '2ebc286a-c1e1-4d1b-a9c2-870868777028';

type DonationFormWorkspaceRecord = {
  id?: string | null;
  name?: string | null;
  status?: string | null;
  publicId?: string | null;
  publishedVersion?: string | null;
  publishedAt?: string | null;
  paymentProvider?: string | null;
  providerConfigKey?: string | null;
  config?: Record<string, unknown> | null;
  publishedConfig?: Record<string, unknown> | null;
};

type DonationFormWorkspaceState = {
  internalName: string;
  title: string;
  description: string;
  mode: 'ONE_OFF' | 'ONE_OFF_AND_MONTHLY' | 'RECURRING';
  amountOptionsText: string;
  allowCustomAmount: boolean;
  minimumAmountText: string;
  successUrl: string;
  giftAidEnabled: boolean;
  giftAidTextVersion: string;
  requireAddress: boolean;
  collectPhone: boolean;
  sourceAppealName: string;
  sourceFundName: string;
};

type PublishedState = {
  publicId: string;
  publishedVersion: string;
  iframeUrl: string;
  embedSnippet: string;
};

type PreviewDonationType = 'ONE_OFF' | 'RECURRING';

const normalizeString = (value: string | null | undefined): string =>
  typeof value === 'string' ? value.trim() : '';

const normalizeConfig = (
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const formatMinorUnitsAsMajor = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return '';
  }

  const majorUnits = value / 100;

  return Number.isInteger(majorUnits)
    ? String(majorUnits)
    : majorUnits.toFixed(2).replace(/\.?0+$/, '');
};

const formatAmountOptions = (value: unknown): string => {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .filter(
      (entry): entry is number =>
        typeof entry === 'number' && Number.isInteger(entry) && entry > 0,
    )
    .map((entry) => formatMinorUnitsAsMajor(entry))
    .join(', ');
};

const normalizeMode = (value: unknown): DonationFormWorkspaceState['mode'] => {
  const normalized = normalizeString(
    typeof value === 'string' ? value : undefined,
  ).toUpperCase();

  if (normalized === 'RECURRING') {
    return 'RECURRING';
  }

  if (
    normalized === 'ONE_OFF_AND_MONTHLY' ||
    normalized === 'MONTHLY_AND_ONE_OFF' ||
    normalized === 'MIXED'
  ) {
    return 'ONE_OFF_AND_MONTHLY';
  }

  return 'ONE_OFF';
};

const deriveWorkspaceState = (
  record: DonationFormWorkspaceRecord,
): DonationFormWorkspaceState => {
  const config = normalizeConfig(record.config);

  return {
    internalName: normalizeString(record.name),
    title: normalizeString(
      typeof config.title === 'string' ? config.title : undefined,
    ),
    description: normalizeString(
      typeof config.description === 'string' ? config.description : undefined,
    ),
    mode: normalizeMode(config.mode),
    amountOptionsText: formatAmountOptions(config.amountOptions),
    allowCustomAmount: config.allowCustomAmount === true,
    minimumAmountText: formatMinorUnitsAsMajor(config.minimumAmount),
    successUrl: normalizeString(
      typeof config.successUrl === 'string' ? config.successUrl : undefined,
    ),
    giftAidEnabled: config.giftAidEnabled === true,
    giftAidTextVersion: normalizeString(
      typeof config.giftAidTextVersion === 'string'
        ? config.giftAidTextVersion
        : undefined,
    ),
    requireAddress: config.requireAddress === true,
    collectPhone: config.collectPhone === true,
    sourceAppealName: normalizeString(
      typeof config.sourceAppealName === 'string'
        ? config.sourceAppealName
        : undefined,
    ),
    sourceFundName: normalizeString(
      typeof config.sourceFundName === 'string' ? config.sourceFundName : undefined,
    ),
  };
};

const normalizeComparable = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeComparable);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeComparable(nestedValue)]),
    );
  }

  return value ?? null;
};

const stableStringify = (value: unknown): string =>
  JSON.stringify(normalizeComparable(value));

const buildIframeUrlFromPublicId = (publicId: string): string => {
  const origin =
    typeof globalThis.location?.origin === 'string'
      ? globalThis.location.origin.trim()
      : '';

  if (origin === '') {
    return '';
  }

  return `${origin}/s/donation-forms/embed-frame?publicId=${encodeURIComponent(publicId)}`;
};

const buildIframeEmbedSnippet = (iframeUrl: string): string =>
  iframeUrl === ''
    ? ''
    : `<iframe src="${iframeUrl}" title="Donation form" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="payment *" style="width:100%;min-height:880px;border:0;background:transparent;"></iframe>`;

const parseAmountOptionsText = (value: string): number[] => {
  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');

  if (entries.length === 0) {
    throw new Error('Add at least one suggested donation amount.');
  }

  return entries.map((entry) => {
    const normalized = entry.replace(/£/g, '').trim();
    const amount = Number(normalized);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Invalid donation amount: ${entry}`);
    }

    const minorUnits = Math.round(amount * 100);
    if (Math.abs(minorUnits / 100 - amount) > 0.000001) {
      throw new Error(`Donation amounts can have at most 2 decimal places: ${entry}`);
    }

    return minorUnits;
  });
};

const parseOptionalAmountText = (value: string): number | undefined => {
  const normalized = value.replace(/£/g, '').trim();

  if (normalized === '') {
    return undefined;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Minimum custom amount must be a positive number.');
  }

  const minorUnits = Math.round(amount * 100);
  if (Math.abs(minorUnits / 100 - amount) > 0.000001) {
    throw new Error('Minimum custom amount can have at most 2 decimal places.');
  }

  return minorUnits;
};

const buildUpdatedDraftConfig = ({
  currentConfig,
  state,
}: {
  currentConfig: Record<string, unknown>;
  state: DonationFormWorkspaceState;
}): Record<string, unknown> => {
  const amountOptions = parseAmountOptionsText(state.amountOptionsText);
  const minimumAmount = parseOptionalAmountText(state.minimumAmountText);
  const successUrl = normalizeString(state.successUrl);

  if (successUrl === '') {
    throw new Error('Success URL is required before saving the draft.');
  }

  try {
    new URL(successUrl);
  } catch {
    throw new Error('Success URL must be a valid URL.');
  }

  const title = normalizeString(state.title);
  const description = normalizeString(state.description);
  const sourceAppealName = normalizeString(state.sourceAppealName);
  const sourceFundName = normalizeString(state.sourceFundName);
  const giftAidTextVersion = normalizeString(state.giftAidTextVersion);

  return {
    ...currentConfig,
    mode: state.mode,
    currencyCode:
      normalizeString(
        typeof currentConfig.currencyCode === 'string'
          ? currentConfig.currencyCode
          : undefined,
      ) || 'GBP',
    amountOptions,
    allowCustomAmount: state.allowCustomAmount,
    ...(state.allowCustomAmount && minimumAmount
      ? { minimumAmount }
      : { minimumAmount: null }),
    successUrl,
    giftAidEnabled: state.giftAidEnabled,
    ...(state.giftAidEnabled && giftAidTextVersion !== ''
      ? { giftAidTextVersion }
      : { giftAidTextVersion: null }),
    ...(state.giftAidEnabled
      ? {
          giftAidDeclarationSource:
            normalizeString(
              typeof currentConfig.giftAidDeclarationSource === 'string'
                ? currentConfig.giftAidDeclarationSource
                : undefined,
            ) || 'donation_form_embed',
        }
      : { giftAidDeclarationSource: null }),
    requireAddress: state.requireAddress,
    collectPhone: state.collectPhone,
    ...(title !== '' ? { title } : { title: null }),
    ...(description !== '' ? { description } : { description: null }),
    ...(sourceAppealName !== ''
      ? { sourceAppealName }
      : { sourceAppealName: null }),
    ...(sourceFundName !== '' ? { sourceFundName } : { sourceFundName: null }),
  };
};

const loadDonationForm = async (
  recordId: string,
): Promise<DonationFormWorkspaceRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    donationForm: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      status: true,
      publicId: true,
      publishedVersion: true,
      publishedAt: true,
      paymentProvider: true,
      providerConfigKey: true,
      config: true,
      publishedConfig: true,
    },
  } as any);

  return (result?.donationForm as DonationFormWorkspaceRecord | null) ?? null;
};

const saveDonationFormDraft = async ({
  recordId,
  name,
  config,
}: {
  recordId: string;
  name: string;
  config: Record<string, unknown>;
}): Promise<void> => {
  const client = new CoreApiClient();

  await client.mutation({
    updateDonationForm: {
      __args: {
        id: recordId,
        data: {
          name,
          config,
        },
      },
      id: true,
    },
  } as any);
};

const formatPublishedAt = (value: string | null | undefined): string => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'Not published yet';
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return date.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '96px',
  resize: 'vertical' as const,
};

const embedCodeStyle = {
  margin: 0,
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d8dee4',
  background: '#f6f8fa',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '12px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

const workspaceGridStyle = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
};

const linkStyle = {
  color: '#0969da',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
};

const previewFrameStyle = {
  display: 'grid',
  gap: '12px',
  justifyContent: 'center',
  alignContent: 'start',
  padding: '8px 0 0',
};

const previewStageStyle = {
  borderRadius: '20px',
  background: 'linear-gradient(180deg, #f6f8fb 0%, #edf3f8 100%)',
  border: '1px solid #d8dee4',
  padding: '24px',
  minHeight: '100%',
  boxSizing: 'border-box' as const,
};

const previewShellStyle = {
  width: '100%',
  maxWidth: '640px',
  border: '1px solid #d8dee4',
  borderRadius: '20px',
  background: '#ffffff',
  padding: '24px',
  boxSizing: 'border-box' as const,
  display: 'grid',
  gap: '18px',
  boxShadow: '0 12px 32px rgba(31, 35, 40, 0.08)',
};

const previewAmountGridStyle = {
  display: 'grid',
  gap: '8px',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
};

const previewFieldStyle = {
  border: '1px solid #d0d7de',
  borderRadius: '8px',
  background: '#ffffff',
  padding: '10px 12px',
  fontSize: '14px',
  color: '#57606a',
};

const previewPaymentPlaceholderStyle = {
  border: '1px dashed #8c959f',
  borderRadius: '12px',
  background: '#f6f8fa',
  padding: '18px',
  display: 'grid',
  gap: '6px',
  textAlign: 'center' as const,
};

const previewSectionStyle = {
  display: 'grid',
  gap: '10px',
};

const previewSubtleCardStyle = {
  border: '1px solid #d8dee4',
  borderRadius: '12px',
  background: '#f6f8fa',
  padding: '12px',
  display: 'grid',
  gap: '8px',
};

const compactSectionStyle = {
  display: 'grid',
  gap: '12px',
};

const compactMetaGridStyle = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

const slimCardStyle = {
  ...cardStyle,
  display: 'grid',
  gap: '12px',
};

const formatPreviewAmount = (minorUnits: number): string => {
  const majorUnits = minorUnits / 100;

  return Number.isInteger(majorUnits)
    ? `£${majorUnits}`
    : `£${majorUnits.toFixed(2).replace(/\.?0+$/, '')}`;
};

const getPreviewDonationTypeOptions = (
  mode: DonationFormWorkspaceState['mode'],
): PreviewDonationType[] => {
  if (mode === 'RECURRING') {
    return ['RECURRING'];
  }

  if (mode === 'ONE_OFF_AND_MONTHLY') {
    return ['ONE_OFF', 'RECURRING'];
  }

  return ['ONE_OFF'];
};

const getPreviewAddressModeLabel = ({
  requireAddress,
  giftAidEnabled,
}: {
  requireAddress: boolean;
  giftAidEnabled: boolean;
}): string => {
  if (requireAddress) {
    return 'Address always shown';
  }

  if (giftAidEnabled) {
    return 'Address shown when Gift Aid is selected';
  }

  return 'Address hidden by default';
};

const DonationFormWorkspace = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<DonationFormWorkspaceRecord | null>(null);
  const [state, setState] = useState<DonationFormWorkspaceState | null>(null);
  const [savedState, setSavedState] = useState<DonationFormWorkspaceState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedState, setPublishedState] = useState<PublishedState | null>(null);
  const [previewDonationType, setPreviewDonationType] =
    useState<PreviewDonationType>('ONE_OFF');
  const [previewGiftAidSelected, setPreviewGiftAidSelected] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No donation form selected.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadDonationForm(recordId);

        if (!loaded?.id) {
          setRecord(null);
          setState(null);
          setSavedState(null);
          setError('Donation form not found.');
          return;
        }

        const nextState = deriveWorkspaceState(loaded);
        setRecord(loaded);
        setState(nextState);
        setSavedState(nextState);
      } catch (loadError) {
        setRecord(null);
        setState(null);
        setSavedState(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the donation form workspace.',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  useEffect(() => {
    if (!state) {
      return;
    }

    const allowedTypes = getPreviewDonationTypeOptions(state.mode);

    setPreviewDonationType((current) =>
      allowedTypes.includes(current) ? current : allowedTypes[0],
    );

    if (!state.giftAidEnabled) {
      setPreviewGiftAidSelected(false);
    }
  }, [state]);

  const persistedPublicId = normalizeString(record?.publicId);
  const effectivePublishedState =
    publishedState ??
    (persistedPublicId === ''
      ? null
      : {
          publicId: persistedPublicId,
          publishedVersion: normalizeString(record?.publishedVersion),
          iframeUrl: buildIframeUrlFromPublicId(persistedPublicId),
          embedSnippet: buildIframeEmbedSnippet(
            buildIframeUrlFromPublicId(persistedPublicId),
          ),
        });

  const hasUnsavedChanges =
    state && savedState
      ? stableStringify(state) !== stableStringify(savedState)
      : false;
  const draftMatchesPublished =
    stableStringify(normalizeConfig(record?.config)) ===
    stableStringify(normalizeConfig(record?.publishedConfig));

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

  const handlePublish = async () => {
    if (!recordId || !record) {
      return;
    }

    if (hasUnsavedChanges) {
      await enqueueSnackbar({
        message: 'Save the draft before publishing.',
        variant: 'info',
      });
      return;
    }

    setPublishing(true);

    try {
      const response = await publishDonationForm({
        donationFormId: recordId,
      });

      setPublishedState({
        publicId: response.publicId,
        publishedVersion: response.publishedVersion,
        iframeUrl: response.iframeUrl,
        embedSnippet: response.embedSnippet,
      });
      setRecord((current) =>
        current
          ? {
              ...current,
              status: response.status,
              publicId: response.publicId,
              publishedVersion: response.publishedVersion,
              publishedAt: new Date().toISOString(),
              publishedConfig: normalizeConfig(current.config),
            }
          : current,
      );

      await enqueueSnackbar({
        message:
          normalizeString(record.status) === 'LIVE'
            ? 'Donation form republished.'
            : 'Donation form published.',
        variant: 'success',
      });
    } catch (publishError) {
      await enqueueSnackbar({
        message:
          publishError instanceof Error
            ? publishError.message
            : 'Unable to publish donation form.',
        variant: 'error',
      });
    } finally {
      setPublishing(false);
    }
  };

  const stateBadge = hasUnsavedChanges
    ? { label: 'Unsaved draft changes', tone: 'warning' as const }
    : effectivePublishedState
      ? draftMatchesPublished
        ? { label: 'Published and in sync', tone: 'success' as const }
        : { label: 'Saved draft not published', tone: 'warning' as const }
      : { label: 'Draft only', tone: 'neutral' as const };

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donation form workspace…</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record || !state) {
    return <div style={secondaryTextStyle}>Donation form not found.</div>;
  }

  const previewAmountOptions = (() => {
    try {
      return parseAmountOptionsText(state.amountOptionsText);
    } catch {
      return [] as number[];
    }
  })();
  const previewSupportsGiftAid = state.giftAidEnabled;
  const previewShowsAddress =
    state.requireAddress || (previewSupportsGiftAid && previewGiftAidSelected);
  const previewDonationTypeOptions = getPreviewDonationTypeOptions(state.mode);
  const previewPrimaryButtonLabel =
    previewDonationType === 'RECURRING'
      ? 'Continue to secure monthly payment'
      : 'Continue to secure payment';
  const previewSummaryLabel =
    previewDonationType === 'RECURRING'
      ? 'Monthly donation'
      : 'One-off donation';

  return (
    <div style={panelStackStyle}>
      <div style={sectionHeaderStyle}>
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={badgeStyle(stateBadge.tone)}>{stateBadge.label}</div>
            <div style={secondaryTextStyle}>
              Configure the draft donation form here. Use the published form link
              to open and test the current live version in a separate tab.
            </div>
          </div>
        <div style={actionRowStyle}>
          <Button
            title={saving ? 'Saving draft…' : 'Save draft'}
            variant="secondary"
            onClick={() => {
              void handleSaveDraft();
            }}
            disabled={saving || publishing || !hasUnsavedChanges}
          />
          <Button
            title={
              publishing
                ? 'Publishing…'
                : normalizeString(record.status) === 'LIVE'
                  ? 'Republish form'
                  : 'Publish form'
            }
            variant="primary"
            onClick={() => {
              void handlePublish();
            }}
            disabled={saving || publishing}
          />
        </div>
      </div>

      <div style={workspaceGridStyle}>
        <div style={panelStackStyle}>
          <div style={slimCardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <div style={labelStyle}>Form settings</div>
                <div style={secondaryTextStyle}>
                  Keep the form opinionated. This editor supports the standard
                  donation surface, not arbitrary form building.
                </div>
              </div>
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
                  <option value="ONE_OFF_AND_MONTHLY">
                    One-off and monthly
                  </option>
                  <option value="RECURRING">Monthly only</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Suggested amounts (GBP)</span>
                <input
                  style={inputStyle}
                  value={state.amountOptionsText}
                  onChange={(event) =>
                    handleFieldChange(
                      'amountOptionsText',
                      getInputEventValue(event),
                    )
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
                    handleFieldChange(
                      'minimumAmountText',
                      getInputEventValue(event),
                    )
                  }
                  placeholder="5"
                />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Success URL</span>
                <input
                  style={inputStyle}
                  value={state.successUrl}
                  onChange={(event) =>
                    handleFieldChange('successUrl', getInputEventValue(event))
                  }
                  placeholder="https://charity.example.org/thank-you"
                />
              </label>
            </div>

            <div style={fieldGridStyle}>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={state.allowCustomAmount}
                  onChange={(event) =>
                    handleFieldChange(
                      'allowCustomAmount',
                      getInputEventChecked(event),
                    )
                  }
                />
                <span style={valueStyle}>Allow custom amount</span>
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={state.giftAidEnabled}
                  onChange={(event) =>
                    handleFieldChange(
                      'giftAidEnabled',
                      getInputEventChecked(event),
                    )
                  }
                />
                <span style={valueStyle}>Enable Gift Aid</span>
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={state.requireAddress}
                  onChange={(event) =>
                    handleFieldChange(
                      'requireAddress',
                      getInputEventChecked(event),
                    )
                  }
                />
                <span style={valueStyle}>Always require address</span>
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={state.collectPhone}
                  onChange={(event) =>
                    handleFieldChange(
                      'collectPhone',
                      getInputEventChecked(event),
                    )
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
                      handleFieldChange(
                        'giftAidTextVersion',
                        getInputEventValue(event),
                      )
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
                    handleFieldChange(
                      'sourceAppealName',
                      getInputEventValue(event),
                    )
                  }
                />
              </label>

              <label style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Default fund name</span>
                <input
                  style={inputStyle}
                  value={state.sourceFundName}
                  onChange={(event) =>
                    handleFieldChange(
                      'sourceFundName',
                      getInputEventValue(event),
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div style={slimCardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <div style={labelStyle}>Publish and embed</div>
                <div style={secondaryTextStyle}>
                  Publish the saved draft to update the live form and website
                  embed.
                </div>
              </div>
            </div>

            <div style={compactMetaGridStyle}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Status</span>
                <span style={valueStyle}>
                  {normalizeString(record.status) || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Public ID</span>
                <span style={valueStyle}>
                  {effectivePublishedState?.publicId || 'Not published yet'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Published version</span>
                <span style={valueStyle}>
                  {effectivePublishedState?.publishedVersion || 'Not published yet'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Published at</span>
                <span style={valueStyle}>
                  {formatPublishedAt(record.publishedAt)}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Payment provider</span>
                <span style={valueStyle}>
                  {normalizeString(record.paymentProvider) || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <span style={labelStyle}>Provider config key</span>
                <span style={valueStyle}>
                  {normalizeString(record.providerConfigKey) || 'Missing'}
                </span>
              </div>
            </div>

            {effectivePublishedState?.iframeUrl ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                <a
                  href={effectivePublishedState.iframeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  Open live form
                </a>
                <div style={secondaryTextStyle}>
                  Opens the current published donation form in a new tab for live
                  testing.
                </div>
              </div>
            ) : null}

            {effectivePublishedState?.embedSnippet ? (
              <div style={{ display: 'grid', gap: '6px' }}>
                <div style={labelStyle}>Iframe embed snippet</div>
                <pre style={embedCodeStyle}>{effectivePublishedState.embedSnippet}</pre>
              </div>
            ) : (
              <div style={secondaryTextStyle}>
                Publish the form once to generate the iframe embed snippet.
              </div>
            )}
          </div>
        </div>

        <div style={panelStackStyle}>
          <div style={slimCardStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <div style={labelStyle}>Draft visual preview</div>
                <div style={secondaryTextStyle}>
                  This simulates the draft form layout and conditional behaviour.
                  Secure payment fields appear only on the live form.
                </div>
              </div>
            </div>

            <div style={previewStageStyle}>
              <div style={previewFrameStyle}>
                <div style={previewShellStyle}>
                  <div style={previewSectionStyle}>
                    <div style={{ display: 'grid', gap: '4px' }}>
                      <div
                        style={{
                          fontSize: '24px',
                          lineHeight: 1.2,
                          fontWeight: 700,
                          color: '#1f2328',
                        }}
                      >
                        {normalizeString(state.title) || 'Support our work'}
                      </div>
                      {normalizeString(state.description) !== '' ? (
                        <div style={{ ...secondaryTextStyle, color: '#57606a' }}>
                          {normalizeString(state.description)}
                        </div>
                      ) : null}
                    </div>

                    {previewDonationTypeOptions.length > 1 ? (
                      <div style={previewSubtleCardStyle}>
                        <div style={labelStyle}>Donation type</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {previewDonationTypeOptions.map((option) => {
                            const active = previewDonationType === option;
                            const label =
                              option === 'RECURRING' ? 'Monthly' : 'One-off';

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setPreviewDonationType(option)}
                                style={{
                                  border: active
                                    ? '1px solid #0969da'
                                    : '1px solid #d0d7de',
                                  background: active ? '#ddf4ff' : '#ffffff',
                                  color: active ? '#0969da' : '#1f2328',
                                  borderRadius: '999px',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div style={previewSectionStyle}>
                    <div style={labelStyle}>Choose your amount</div>
                    {previewAmountOptions.length > 0 ? (
                      <div style={previewAmountGridStyle}>
                        {previewAmountOptions.map((amount, index) => (
                          <div
                            key={`${amount}:${index}`}
                            style={{
                              border: index === 1
                                ? '2px solid #0969da'
                                : '1px solid #d0d7de',
                              background: index === 1 ? '#ddf4ff' : '#ffffff',
                              color: '#1f2328',
                              borderRadius: '10px',
                              padding: '12px 10px',
                              textAlign: 'center',
                              fontSize: '15px',
                              fontWeight: 600,
                            }}
                          >
                            {formatPreviewAmount(amount)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={secondaryTextStyle}>
                        Add suggested amounts to see them here.
                      </div>
                    )}

                    {state.allowCustomAmount ? (
                      <div style={previewSubtleCardStyle}>
                        <div style={labelStyle}>Custom amount</div>
                        <div style={previewFieldStyle}>
                          {normalizeString(state.minimumAmountText) !== ''
                            ? `Minimum ${normalizeString(state.minimumAmountText).startsWith('£') ? normalizeString(state.minimumAmountText) : `£${normalizeString(state.minimumAmountText)}`}`
                            : 'Donors can enter a custom amount'}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div style={previewSectionStyle}>
                    <div style={labelStyle}>Donor details</div>
                    <div style={previewFieldStyle}>First name</div>
                    <div style={previewFieldStyle}>Last name</div>
                    <div style={previewFieldStyle}>Email address</div>
                    {state.collectPhone ? (
                      <div style={previewFieldStyle}>Phone number</div>
                    ) : null}
                  </div>

                  {previewSupportsGiftAid ? (
                    <div style={previewSectionStyle}>
                      <div style={labelStyle}>Gift Aid</div>
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
                            Add Gift Aid to this donation
                          </div>
                          <div style={secondaryTextStyle}>
                            The live form uses the configured declaration wording
                            and asks for a home address when needed.
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : null}

                  {previewShowsAddress ? (
                    <div style={previewSectionStyle}>
                      <div style={labelStyle}>Home address for Gift Aid</div>
                      <div style={previewFieldStyle}>Building and street</div>
                      <div style={previewFieldStyle}>Address line 2 (optional)</div>
                      <div style={previewFieldStyle}>Town or city</div>
                      <div style={previewFieldStyle}>County (optional)</div>
                      <div style={previewFieldStyle}>Postcode</div>
                      <div style={previewFieldStyle}>Country</div>
                    </div>
                  ) : null}

                  <div style={previewPaymentPlaceholderStyle}>
                    <div style={{ ...valueStyle, fontWeight: 700 }}>
                      Secure payment fields appear here on the live form
                    </div>
                    <div style={secondaryTextStyle}>
                      Stripe Payment Element is mounted only in the published form.
                    </div>
                  </div>

                  <div style={previewSubtleCardStyle}>
                    <div style={labelStyle}>Preview notes</div>
                    <div style={secondaryTextStyle}>
                      {previewSummaryLabel}
                    </div>
                    <div style={secondaryTextStyle}>
                      {getPreviewAddressModeLabel({
                        requireAddress: state.requireAddress,
                        giftAidEnabled: state.giftAidEnabled,
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '12px',
                      background: '#1f2328',
                      color: '#ffffff',
                      padding: '14px 16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    {previewPrimaryButtonLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    DONATION_FORM_WORKSPACE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'donation-form-workspace',
  description:
    'Donation form workspace with opinionated draft settings, publish controls, embed snippet, and published-form access.',
  component: DonationFormWorkspace,
});
