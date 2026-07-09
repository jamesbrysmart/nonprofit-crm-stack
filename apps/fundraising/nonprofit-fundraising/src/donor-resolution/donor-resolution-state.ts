export type DonorResolutionState =
  | 'UNREVIEWED'
  | 'AMBIGUOUS'
  | 'NEW_DONOR'
  | 'CONFIRMED';

const VALID_DONOR_RESOLUTION_STATES = new Set<DonorResolutionState>([
  'UNREVIEWED',
  'AMBIGUOUS',
  'NEW_DONOR',
  'CONFIRMED',
]);

export const normalizeDonorResolutionState = (
  value: string | null | undefined,
): DonorResolutionState => {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';

  return VALID_DONOR_RESOLUTION_STATES.has(
    normalized as DonorResolutionState,
  )
    ? (normalized as DonorResolutionState)
    : 'UNREVIEWED';
};
