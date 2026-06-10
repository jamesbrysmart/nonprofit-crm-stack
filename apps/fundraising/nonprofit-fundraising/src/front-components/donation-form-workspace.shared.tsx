import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import type {
  AppealSourceSummary,
  AppealSummary,
  FundSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  codeBlockStyle,
  linkStyle,
  panelStyle,
  textareaStyle,
} from 'src/front-components/front-component-ui';
import {
  normalizeDonationFormAmountOptions,
  type DonationFormConfiguredAppeal,
  type DonationFormConfiguredAppealSource,
  type DonationFormConfiguredFund,
  normalizeDonationFormConfigObject,
  normalizeDonationFormMode,
  normalizeDonationFormString,
} from 'src/donation-forms/donation-form-config';

export type DonationFormWorkspaceRecord = {
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

export type DonationFormWorkspaceState = {
  internalName: string;
  title: string;
  description: string;
  primaryColor: string;
  thankYouMessage: string;
  mode: 'ONE_OFF' | 'ONE_OFF_AND_MONTHLY' | 'RECURRING';
  amountOptionsText: string;
  allowCustomAmount: boolean;
  minimumAmountText: string;
  giftAidEnabled: boolean;
  giftAidTextVersion: string;
  requireAddress: boolean;
  collectPhone: boolean;
  selectedAppealId: string;
  selectedFundId: string;
  selectedAppealSourceId: string;
};

export type PublishedState = {
  publicId: string;
  publishedVersion: string;
  iframeUrl: string;
  embedSnippet: string;
};

export type PreviewDonationType = 'ONE_OFF' | 'RECURRING';

export const DEFAULT_DONATION_FORM_WORKSPACE_STATE: DonationFormWorkspaceState = {
  internalName: 'New donation form',
  title: 'Support our work',
  description: 'Help fund our work with a one-off or monthly donation.',
  primaryColor: '#0d7a5f',
  thankYouMessage: 'Thank you for your donation. Your support helps fund our work.',
  mode: 'ONE_OFF_AND_MONTHLY',
  amountOptionsText: '10, 25, 50',
  allowCustomAmount: true,
  minimumAmountText: '5',
  giftAidEnabled: false,
  giftAidTextVersion: '',
  requireAddress: false,
  collectPhone: false,
  selectedAppealId: '',
  selectedFundId: '',
  selectedAppealSourceId: '',
};

export const normalizeString = normalizeDonationFormString;

export const normalizeConfig = (
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> => normalizeDonationFormConfigObject(value);

export const formatMinorUnitsAsMajor = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return '';
  }

  const majorUnits = value / 100;

  return Number.isInteger(majorUnits)
    ? String(majorUnits)
    : majorUnits.toFixed(2).replace(/\.?0+$/, '');
};

export const formatAmountOptions = (value: unknown): string => {
  if (!Array.isArray(value)) {
    return '';
  }

  return normalizeDonationFormAmountOptions(value)
    .map((entry) => formatMinorUnitsAsMajor(entry))
    .join(', ');
};

export const normalizeMode = (
  value: unknown,
): DonationFormWorkspaceState['mode'] => normalizeDonationFormMode(value);

export const deriveWorkspaceState = (
  record: DonationFormWorkspaceRecord,
): DonationFormWorkspaceState => {
  const config = normalizeConfig(record.config);
  const defaultAppeal =
    typeof config.defaultAppeal === 'object' && config.defaultAppeal !== null
      ? (config.defaultAppeal as DonationFormConfiguredAppeal)
      : null;
  const defaultFund =
    typeof config.defaultFund === 'object' && config.defaultFund !== null
      ? (config.defaultFund as DonationFormConfiguredFund)
      : null;
  const defaultAppealSource =
    typeof config.defaultAppealSource === 'object' &&
    config.defaultAppealSource !== null
      ? (config.defaultAppealSource as DonationFormConfiguredAppealSource)
      : null;

  return {
    internalName:
      normalizeString(record.name) ||
      DEFAULT_DONATION_FORM_WORKSPACE_STATE.internalName,
    title: normalizeString(
      typeof config.title === 'string' ? config.title : undefined,
    ) || DEFAULT_DONATION_FORM_WORKSPACE_STATE.title,
    description: normalizeString(
      typeof config.description === 'string' ? config.description : undefined,
    ) || DEFAULT_DONATION_FORM_WORKSPACE_STATE.description,
    primaryColor:
      normalizeString(
        typeof config.primaryColor === 'string' ? config.primaryColor : undefined,
      ) || DEFAULT_DONATION_FORM_WORKSPACE_STATE.primaryColor,
    thankYouMessage:
      normalizeString(
        typeof config.thankYouMessage === 'string'
          ? config.thankYouMessage
          : undefined,
      ) || DEFAULT_DONATION_FORM_WORKSPACE_STATE.thankYouMessage,
    mode:
      Object.keys(config).length > 0
        ? normalizeMode(config.mode)
        : DEFAULT_DONATION_FORM_WORKSPACE_STATE.mode,
    amountOptionsText:
      formatAmountOptions(config.amountOptions) ||
      DEFAULT_DONATION_FORM_WORKSPACE_STATE.amountOptionsText,
    allowCustomAmount:
      typeof config.allowCustomAmount === 'boolean'
        ? config.allowCustomAmount === true
        : DEFAULT_DONATION_FORM_WORKSPACE_STATE.allowCustomAmount,
    minimumAmountText:
      formatMinorUnitsAsMajor(config.minimumAmount) ||
      DEFAULT_DONATION_FORM_WORKSPACE_STATE.minimumAmountText,
    giftAidEnabled: config.giftAidEnabled === true,
    giftAidTextVersion: normalizeString(
      typeof config.giftAidTextVersion === 'string'
        ? config.giftAidTextVersion
        : undefined,
    ),
    requireAddress: config.requireAddress === true,
    collectPhone: config.collectPhone === true,
    selectedAppealId:
      normalizeString(defaultAppeal?.id) ||
      normalizeString(defaultAppealSource?.appeal?.id),
    selectedFundId:
      normalizeString(defaultFund?.id) ||
      normalizeString(defaultAppeal?.defaultFund?.id) ||
      normalizeString(defaultAppealSource?.appeal?.defaultFund?.id),
    selectedAppealSourceId: normalizeString(defaultAppealSource?.id),
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

export const stableStringify = (value: unknown): string =>
  JSON.stringify(normalizeComparable(value));

export const buildIframeUrlFromPublicId = (publicId: string): string => {
  const origin =
    typeof globalThis.location?.origin === 'string'
      ? globalThis.location.origin.trim()
      : '';

  if (origin === '') {
    return '';
  }

  return `${origin}/s/donation-forms/embed-frame?publicId=${encodeURIComponent(publicId)}`;
};

export const buildIframeEmbedSnippet = (iframeUrl: string): string =>
  iframeUrl === ''
    ? ''
    : `<iframe src="${iframeUrl}" title="Donation form" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="payment *" style="width:100%;min-height:880px;border:0;background:transparent;"></iframe>`;

export const parseAmountOptionsText = (value: string): number[] => {
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

export const parseOptionalAmountText = (value: string): number | undefined => {
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

const normalizeHexColor = (value: string): string => {
  const normalized = value.trim();
  const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  if (!hexPattern.test(normalized)) {
    throw new Error('Primary colour must be a valid hex colour, for example #0d7a5f.');
  }

  if (normalized.length === 4) {
    const [, r, g, b] = normalized;

    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return normalized.toLowerCase();
};

const relativeLuminance = (hexColor: string): number => {
  const rgb = [1, 3, 5].map((index) =>
    Number.parseInt(hexColor.slice(index, index + 2), 16) / 255,
  );

  const linearized = rgb.map((channel) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return (
    0.2126 * linearized[0] +
    0.7152 * linearized[1] +
    0.0722 * linearized[2]
  );
};

const contrastRatioWithWhite = (hexColor: string): number => {
  const luminance = relativeLuminance(hexColor);

  return (1.05 + 0.05) / (luminance + 0.05);
};

export const buildUpdatedDraftConfig = ({
  currentConfig,
  state,
  appeals,
  appealSources,
  funds,
}: {
  currentConfig: Record<string, unknown>;
  state: DonationFormWorkspaceState;
  appeals: AppealSummary[];
  appealSources: AppealSourceSummary[];
  funds: FundSummary[];
}): Record<string, unknown> => {
  const amountOptions = parseAmountOptionsText(state.amountOptionsText);
  const minimumAmount = parseOptionalAmountText(state.minimumAmountText);
  const title = normalizeString(state.title);
  const description = normalizeString(state.description);
  const primaryColor = normalizeHexColor(state.primaryColor);
  const thankYouMessage = normalizeString(state.thankYouMessage);
  const giftAidTextVersion = normalizeString(state.giftAidTextVersion);
  const selectedAppealId = normalizeString(state.selectedAppealId);
  const selectedAppealSourceId = normalizeString(state.selectedAppealSourceId);
  const selectedFundId = normalizeString(state.selectedFundId);
  const selectedAppeal = appeals.find(
    (appeal) => normalizeString(appeal.id) === selectedAppealId,
  );
  const selectedAppealSource = appealSources.find(
    (appealSource) =>
      normalizeString(appealSource.id) === selectedAppealSourceId,
  );
  const selectedFund = funds.find(
    (fund) => normalizeString(fund.id) === selectedFundId,
  );

  if (selectedAppealId !== '' && !selectedAppeal) {
    throw new Error('Selected appeal was not found.');
  }

  if (selectedAppealSourceId !== '' && !selectedAppealSource) {
    throw new Error('Selected appeal source was not found.');
  }

  if (selectedFundId !== '' && !selectedFund) {
    throw new Error('Selected fund was not found.');
  }

  const selectedAppealSourceAppealId = normalizeString(
    selectedAppealSource?.appeal?.id,
  );

  if (
    selectedAppealId !== '' &&
    selectedAppealSourceAppealId !== '' &&
    selectedAppealId !== selectedAppealSourceAppealId
  ) {
    throw new Error(
      'Selected appeal source does not belong to the selected appeal.',
    );
  }

  const resolvedAppeal =
    selectedAppeal ??
    (selectedAppealSource?.appeal
      ? {
          id: selectedAppealSource.appeal.id ?? '',
          name: selectedAppealSource.appeal.name ?? null,
          defaultFund: selectedAppealSource.appeal.defaultFund ?? null,
        }
      : null);
  const resolvedFund =
    selectedFund ??
    (resolvedAppeal?.defaultFund
      ? {
          id: resolvedAppeal.defaultFund.id ?? '',
          name: resolvedAppeal.defaultFund.name ?? null,
        }
      : null);

  const defaultAppeal =
    normalizeString(resolvedAppeal?.id) !== ''
      ? {
          id: normalizeString(resolvedAppeal?.id),
          ...(normalizeString(resolvedAppeal?.name) !== ''
            ? { name: normalizeString(resolvedAppeal?.name) }
            : {}),
          ...(normalizeString(resolvedAppeal?.defaultFund?.id) !== ''
            ? {
                defaultFund: {
                  id: normalizeString(resolvedAppeal?.defaultFund?.id),
                  ...(normalizeString(resolvedAppeal?.defaultFund?.name) !== ''
                    ? {
                        name: normalizeString(
                          resolvedAppeal?.defaultFund?.name,
                        ),
                      }
                    : {}),
                },
              }
            : {}),
        }
      : null;
  const defaultFund =
    normalizeString(resolvedFund?.id) !== ''
      ? {
          id: normalizeString(resolvedFund?.id),
          ...(normalizeString(resolvedFund?.name) !== ''
            ? { name: normalizeString(resolvedFund?.name) }
            : {}),
        }
      : null;
  const defaultAppealSource =
    selectedAppealSourceId !== ''
      ? {
          id: selectedAppealSourceId,
          ...(normalizeString(selectedAppealSource?.name) !== ''
            ? { name: normalizeString(selectedAppealSource?.name) }
            : {}),
          ...(defaultAppeal ? { appeal: defaultAppeal } : {}),
        }
      : null;
  const sourceAppealName =
    normalizeString(defaultAppealSource?.appeal?.name) ||
    normalizeString(defaultAppeal?.name);
  const sourceFundName = normalizeString(defaultFund?.name);

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
    ...(thankYouMessage !== ''
      ? { thankYouMessage }
      : { thankYouMessage: null }),
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
    ...(contrastRatioWithWhite(primaryColor) >= 3
      ? { primaryColor }
      : (() => {
          throw new Error(
            'Primary colour is too light for white button text. Choose a darker colour.',
          );
        })()),
    ...(defaultAppeal ? { defaultAppeal } : { defaultAppeal: null }),
    ...(defaultFund ? { defaultFund } : { defaultFund: null }),
    ...(defaultAppealSource
      ? { defaultAppealSource }
      : { defaultAppealSource: null }),
    ...(sourceAppealName !== ''
      ? { sourceAppealName }
      : { sourceAppealName: null }),
    ...(sourceFundName !== '' ? { sourceFundName } : { sourceFundName: null }),
  };
};

export const loadDonationForm = async (
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

export const saveDonationFormDraft = async ({
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

export const formatPublishedAt = (
  value: string | null | undefined,
): string => {
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

export const derivePublishedState = (
  record: DonationFormWorkspaceRecord | null,
  publishedState?: PublishedState | null,
): PublishedState | null => {
  if (publishedState) {
    return publishedState;
  }

  const persistedPublicId = normalizeString(record?.publicId);
  if (persistedPublicId === '') {
    return null;
  }

  const iframeUrl = buildIframeUrlFromPublicId(persistedPublicId);

  return {
    publicId: persistedPublicId,
    publishedVersion: normalizeString(record?.publishedVersion),
    iframeUrl,
    embedSnippet: buildIframeEmbedSnippet(iframeUrl),
  };
};

export { textareaStyle, linkStyle, panelStyle };

export const embedCodeStyle = codeBlockStyle;

export const previewFrameStyle = {
  display: 'grid',
  gap: '12px',
  alignContent: 'start',
  padding: '8px 0 0',
};

export const previewStageStyle = {
  borderRadius: '20px',
  background: 'linear-gradient(180deg, #f6f8fb 0%, #edf3f8 100%)',
  border: '1px solid #d8dee4',
  padding: '24px',
  minHeight: '100%',
  boxSizing: 'border-box' as const,
};

export const previewIframeStyle = {
  width: '100%',
  maxWidth: '640px',
  border: '1px solid #d8dee4',
  borderRadius: '20px',
  background: '#ffffff',
  minHeight: '1100px',
  boxSizing: 'border-box' as const,
  boxShadow: '0 12px 32px rgba(31, 35, 40, 0.08)',
  overflow: 'hidden' as const,
};

export const previewControlGridStyle = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

export const previewSubtleCardStyle = {
  border: '1px solid #d8dee4',
  borderRadius: '12px',
  background: '#f6f8fa',
  padding: '12px',
  display: 'grid',
  gap: '8px',
};

export const compactSectionStyle = {
  display: 'grid',
  gap: '12px',
};

export const compactMetaGridStyle = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
};

export const getPreviewDonationTypeOptions = (
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

export const getPreviewAddressModeLabel = ({
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

export const buildPreviewConfig = ({
  currentConfig,
  state,
}: {
  currentConfig: Record<string, unknown>;
  state: DonationFormWorkspaceState;
}) => {
  const currencyCode =
    normalizeString(
      typeof currentConfig.currencyCode === 'string'
        ? currentConfig.currencyCode
        : undefined,
    ) || 'GBP';

  const amountOptions = (() => {
    try {
      return parseAmountOptionsText(state.amountOptionsText);
    } catch {
      return [];
    }
  })();

  const minimumAmount = (() => {
    try {
      return parseOptionalAmountText(state.minimumAmountText);
    } catch {
      return undefined;
    }
  })();

  return {
    title: normalizeString(state.title) || null,
    description: normalizeString(state.description) || null,
    primaryColor:
      normalizeString(state.primaryColor) || DEFAULT_DONATION_FORM_WORKSPACE_STATE.primaryColor,
    thankYouMessage:
      normalizeString(state.thankYouMessage) ||
      DEFAULT_DONATION_FORM_WORKSPACE_STATE.thankYouMessage,
    mode: state.mode,
    currencyCode,
    amountOptions,
    allowCustomAmount: state.allowCustomAmount,
    minimumAmount: state.allowCustomAmount ? minimumAmount ?? null : null,
    giftAidEnabled: state.giftAidEnabled,
    giftAidTextVersion: state.giftAidEnabled
      ? normalizeString(state.giftAidTextVersion) || null
      : null,
    requireAddress: state.requireAddress,
    collectPhone: state.collectPhone,
  };
};

export const useDonationFormRecord = (recordId: string | null | undefined) => {
  const [record, setRecord] = useState<DonationFormWorkspaceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No donation form selected.');
        setRecord(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadDonationForm(recordId);

        if (!loaded?.id) {
          setRecord(null);
          setError('Donation form not found.');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
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

  return {
    record,
    setRecord,
    loading,
    error,
  };
};
