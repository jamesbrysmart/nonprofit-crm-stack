export type DonationFormDonationType = 'ONE_OFF' | 'RECURRING';

export type DonationFormMode =
  | 'ONE_OFF'
  | 'ONE_OFF_AND_MONTHLY'
  | 'RECURRING';

export type DonationFormPublishedConfig = {
  title?: string;
  description?: string;
  primaryColor?: string;
  thankYouMessage?: string;
  mode?: string;
  currencyCode?: string;
  amountOptions?: number[];
  allowCustomAmount?: boolean;
  minimumAmount?: number;
  cancelUrl?: string;
  giftAidEnabled?: boolean;
  giftAidTextVersion?: string;
  giftAidDeclarationSource?: string;
  defaultAppeal?: DonationFormConfiguredAppeal;
  defaultFund?: DonationFormConfiguredFund;
  defaultAppealSource?: DonationFormConfiguredAppealSource;
  sourceAppealName?: string;
  sourceFundName?: string;
  requireAddress?: boolean;
  collectPhone?: boolean;
};

export type DonationFormConfiguredFund = {
  id: string;
  name?: string;
};

export type DonationFormConfiguredAppeal = {
  id: string;
  name?: string;
  defaultFund?: DonationFormConfiguredFund | null;
};

export type DonationFormConfiguredAppealSource = {
  id: string;
  name?: string;
  appeal?: DonationFormConfiguredAppeal | null;
};

export const normalizeDonationFormString = (
  value: string | null | undefined,
): string => (typeof value === 'string' ? value.trim() : '');

export const normalizeDonationFormConfigObject = (
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export const normalizeDonationFormAmountOptions = (value: unknown): number[] =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is number =>
          typeof entry === 'number' && Number.isInteger(entry) && entry > 0,
      )
    : [];

const normalizeDonationFormConfiguredFund = (
  value: unknown,
): DonationFormConfiguredFund | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const id = normalizeDonationFormString(
    (value as { id?: string | null }).id,
  );

  if (id === '') {
    return undefined;
  }

  const name = normalizeDonationFormString(
    (value as { name?: string | null }).name,
  );

  return {
    id,
    ...(name !== '' ? { name } : {}),
  };
};

const normalizeDonationFormConfiguredAppeal = (
  value: unknown,
): DonationFormConfiguredAppeal | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const id = normalizeDonationFormString(
    (value as { id?: string | null }).id,
  );

  if (id === '') {
    return undefined;
  }

  const name = normalizeDonationFormString(
    (value as { name?: string | null }).name,
  );
  const defaultFund = normalizeDonationFormConfiguredFund(
    (value as { defaultFund?: unknown }).defaultFund,
  );

  return {
    id,
    ...(name !== '' ? { name } : {}),
    ...(defaultFund ? { defaultFund } : {}),
  };
};

const normalizeDonationFormConfiguredAppealSource = (
  value: unknown,
): DonationFormConfiguredAppealSource | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const id = normalizeDonationFormString(
    (value as { id?: string | null }).id,
  );

  if (id === '') {
    return undefined;
  }

  const name = normalizeDonationFormString(
    (value as { name?: string | null }).name,
  );
  const appeal = normalizeDonationFormConfiguredAppeal(
    (value as { appeal?: unknown }).appeal,
  );

  return {
    id,
    ...(name !== '' ? { name } : {}),
    ...(appeal ? { appeal } : {}),
  };
};

export const normalizeDonationFormMode = (value: unknown): DonationFormMode => {
  const normalized = normalizeDonationFormString(
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

export const isDonationFormModePublishable = (value: unknown): boolean => {
  const normalized = normalizeDonationFormString(
    typeof value === 'string' ? value : undefined,
  ).toUpperCase();

  return (
    normalized === 'ONE_OFF' ||
    normalized === 'ONE_OFF_AND_MONTHLY' ||
    normalized === 'MONTHLY_AND_ONE_OFF' ||
    normalized === 'MIXED' ||
    normalized === 'RECURRING'
  );
};

export const resolveDonationFormDonationTypes = (
  value: unknown,
): DonationFormDonationType[] => {
  const normalizedMode = normalizeDonationFormMode(value);

  if (normalizedMode === 'ONE_OFF_AND_MONTHLY') {
    return ['ONE_OFF', 'RECURRING'];
  }

  if (normalizedMode === 'RECURRING') {
    return ['RECURRING'];
  }

  return ['ONE_OFF'];
};

export const normalizeDonationFormPublishedConfig = (
  value: Record<string, unknown> | null | undefined,
): DonationFormPublishedConfig | null => {
  const config = normalizeDonationFormConfigObject(value);

  if (Object.keys(config).length === 0) {
    return null;
  }

  const amountOptions = normalizeDonationFormAmountOptions(config.amountOptions);
  const defaultAppeal = normalizeDonationFormConfiguredAppeal(
    config.defaultAppeal,
  );
  const defaultFund = normalizeDonationFormConfiguredFund(config.defaultFund);
  const defaultAppealSource = normalizeDonationFormConfiguredAppealSource(
    config.defaultAppealSource,
  );

  return {
    title:
      normalizeDonationFormString(config.title as string | null | undefined) ||
      undefined,
    description:
      normalizeDonationFormString(
        config.description as string | null | undefined,
      ) || undefined,
    primaryColor:
      normalizeDonationFormString(
        config.primaryColor as string | null | undefined,
      ) || undefined,
    thankYouMessage:
      normalizeDonationFormString(
        config.thankYouMessage as string | null | undefined,
      ) || undefined,
    mode:
      normalizeDonationFormString(config.mode as string | null | undefined) ||
      undefined,
    currencyCode:
      normalizeDonationFormString(
        config.currencyCode as string | null | undefined,
      ).toUpperCase() || undefined,
    amountOptions: amountOptions.length > 0 ? amountOptions : undefined,
    allowCustomAmount: config.allowCustomAmount === true,
    minimumAmount:
      typeof config.minimumAmount === 'number' &&
      Number.isInteger(config.minimumAmount) &&
      config.minimumAmount > 0
        ? config.minimumAmount
        : undefined,
    cancelUrl:
      normalizeDonationFormString(
        config.cancelUrl as string | null | undefined,
      ) || undefined,
    giftAidEnabled: config.giftAidEnabled === true,
    giftAidTextVersion:
      normalizeDonationFormString(
        config.giftAidTextVersion as string | null | undefined,
      ) || undefined,
    giftAidDeclarationSource:
      normalizeDonationFormString(
        config.giftAidDeclarationSource as string | null | undefined,
      ) || undefined,
    ...(defaultAppeal ? { defaultAppeal } : {}),
    ...(defaultFund ? { defaultFund } : {}),
    ...(defaultAppealSource ? { defaultAppealSource } : {}),
    sourceAppealName:
      normalizeDonationFormString(
        config.sourceAppealName as string | null | undefined,
      ) || undefined,
    sourceFundName:
      normalizeDonationFormString(
        config.sourceFundName as string | null | undefined,
      ) || undefined,
    requireAddress: config.requireAddress === true,
    collectPhone: config.collectPhone === true,
  };
};

export const validatePublishableDonationFormConfig = (
  config: Record<string, unknown>,
): void => {
  const currencyCode = normalizeDonationFormString(
    typeof config.currencyCode === 'string' ? config.currencyCode : undefined,
  );
  const amountOptions = normalizeDonationFormAmountOptions(config.amountOptions);
  const allowCustomAmount = config.allowCustomAmount === true;
  const minimumAmount = config.minimumAmount;

  if (currencyCode === '') {
    throw new Error('Donation form currencyCode is required before publishing');
  }

  if (!isDonationFormModePublishable(config.mode)) {
    throw new Error('Donation form mode is not valid for publishing');
  }

  if (
    amountOptions.length === 0 &&
    !(
      allowCustomAmount &&
      typeof minimumAmount === 'number' &&
      Number.isInteger(minimumAmount) &&
      minimumAmount > 0
    )
  ) {
    throw new Error(
      'Donation form needs suggested amounts or a valid custom minimum before publishing',
    );
  }
};
