const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

export const SOFT_CREDIT_TYPE_VALUES = [
  'FUNDRAISER',
  'INTRODUCER',
  'HOST',
  'MATCHER',
  'ADVOCATE',
  'PARTNER',
  'OTHER',
] as const;

export type SoftCreditType = (typeof SOFT_CREDIT_TYPE_VALUES)[number];

export type ResolvedSoftCreditSelection =
  | {
      mode: 'unchanged';
    }
  | {
      mode: 'set';
      softCreditPersonId: string;
      softCreditCompanyId: string;
      softCreditType: SoftCreditType;
    }
  | {
      mode: 'clear';
      softCreditPersonId: '';
      softCreditCompanyId: '';
      softCreditType: '';
    };

const normalizeSoftCreditType = (
  value: string | null | undefined,
): SoftCreditType | '' => {
  const normalized = normalizeString(value).toUpperCase();

  if (normalized === '') {
    return '';
  }

  if (
    SOFT_CREDIT_TYPE_VALUES.includes(normalized as SoftCreditType)
  ) {
    return normalized as SoftCreditType;
  }

  throw new Error('Selected soft credit type is not valid.');
};

export const resolveSoftCreditSelection = ({
  softCreditPersonId,
  softCreditCompanyId,
  softCreditType,
  treatUndefinedAsUnchanged,
}: {
  softCreditPersonId?: string | null;
  softCreditCompanyId?: string | null;
  softCreditType?: string | null;
  treatUndefinedAsUnchanged?: boolean;
}): ResolvedSoftCreditSelection => {
  if (
    treatUndefinedAsUnchanged === true &&
    softCreditPersonId === undefined &&
    softCreditCompanyId === undefined &&
    softCreditType === undefined
  ) {
    return {
      mode: 'unchanged',
    };
  }

  const normalizedPersonId = normalizeString(softCreditPersonId);
  const normalizedCompanyId = normalizeString(softCreditCompanyId);
  const normalizedType = normalizeSoftCreditType(softCreditType);
  const hasPerson = normalizedPersonId !== '';
  const hasCompany = normalizedCompanyId !== '';

  if (hasPerson && hasCompany) {
    throw new Error(
      'Choose either a soft credit person or a soft credit company, not both.',
    );
  }

  if (!hasPerson && !hasCompany) {
    if (normalizedType !== '') {
      throw new Error(
        'A soft credit person or company is required when a soft credit type is set.',
      );
    }

    return {
      mode: 'clear',
      softCreditPersonId: '',
      softCreditCompanyId: '',
      softCreditType: '',
    };
  }

  if (normalizedType === '') {
    throw new Error(
      'Soft credit type is required when a soft credit person or company is set.',
    );
  }

  return {
    mode: 'set',
    softCreditPersonId: normalizedPersonId,
    softCreditCompanyId: normalizedCompanyId,
    softCreditType: normalizedType,
  };
};
