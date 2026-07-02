import { describe, expect, it, vi } from 'vitest';

const recomputeDonorRollupsMock = vi.hoisted(() => vi.fn());
const recomputeCompanyRollupsMock = vi.hoisted(() => vi.fn());
const recomputeAppealRollupsMock = vi.hoisted(() => vi.fn());
const recomputeAppealSourceRollupsMock = vi.hoisted(() => vi.fn());
const collectIds = vi.hoisted(
  () => (ids: Array<string | null | undefined>) =>
    Array.from(
      new Set(
        ids
          .map((id) => (typeof id === 'string' ? id.trim() : ''))
          .filter((id) => id !== ''),
      ),
    ),
);

vi.mock('src/donor-rollups/donor-rollups', () => ({
  collectDonorIds: collectIds,
  recomputeDonorRollups: recomputeDonorRollupsMock,
}));

vi.mock('src/company-rollups/company-rollups', () => ({
  collectCompanyIds: collectIds,
  recomputeCompanyRollups: recomputeCompanyRollupsMock,
}));

vi.mock('src/appeal-rollups/appeal-rollups', () => ({
  collectAppealIds: collectIds,
  recomputeAppealRollups: recomputeAppealRollupsMock,
}));

vi.mock('src/appeal-source-rollups/appeal-source-rollups', () => ({
  collectAppealSourceIds: collectIds,
  recomputeAppealSourceRollups: recomputeAppealSourceRollupsMock,
}));

vi.mock('src/gift-aid/gift-aid-config', () => ({
  isGiftAidEnabled: () => false,
}));

vi.mock('src/gift-aid-claims/gift-aid-claim-batch', () => ({
  attachGiftsToCurrentDraftClaimBatch: vi.fn(),
}));

import { runBatchProcessingSideEffects } from 'src/batch-processing/batch-processing.executor.effects';
import type { SuccessfulWriteback } from 'src/batch-processing/batch-processing.executor.support';

const buildWriteback = (
  overrides: Partial<SuccessfulWriteback>,
): SuccessfulWriteback => ({
  id: 'staging_1',
  committedGiftId: 'gift_1',
  donorId: 'person_1',
  processingStatus: 'PROCESSED',
  errorDetail: null,
  giftReadyStatus: null,
  executionPath: 'BATCH',
  giftAidStatus: null,
  ...overrides,
});

describe('runBatchProcessingSideEffects', () => {
  it('coalesces rollup recomputes across successful batch writebacks', async () => {
    await runBatchProcessingSideEffects([
      buildWriteback({
        donorId: ' person_1 ',
        companyId: 'company_1',
        appealId: 'appeal_1',
        appealSourceId: 'source_1',
      }),
      buildWriteback({
        id: 'staging_2',
        committedGiftId: 'gift_2',
        donorId: 'person_1',
        companyId: 'company_1',
        appealId: 'appeal_2',
        appealSourceId: 'source_1',
      }),
      buildWriteback({
        id: 'staging_3',
        committedGiftId: 'gift_3',
        donorId: 'person_2',
      }),
    ]);

    expect(recomputeDonorRollupsMock).toHaveBeenCalledTimes(1);
    expect(recomputeDonorRollupsMock.mock.calls[0][1]).toEqual([
      'person_1',
      'person_2',
    ]);

    expect(recomputeCompanyRollupsMock).toHaveBeenCalledTimes(1);
    expect(recomputeCompanyRollupsMock.mock.calls[0][1]).toEqual(['company_1']);

    expect(recomputeAppealRollupsMock).toHaveBeenCalledTimes(1);
    expect(recomputeAppealRollupsMock.mock.calls[0][1]).toEqual([
      'appeal_1',
      'appeal_2',
    ]);

    expect(recomputeAppealSourceRollupsMock).toHaveBeenCalledTimes(1);
    expect(recomputeAppealSourceRollupsMock.mock.calls[0][1]).toEqual([
      'source_1',
    ]);
  });
});
