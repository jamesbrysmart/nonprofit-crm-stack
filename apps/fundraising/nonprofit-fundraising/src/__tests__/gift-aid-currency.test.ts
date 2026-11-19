import { describe, expect, it, vi } from 'vitest';
import type { GiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import { isSterlingAmount } from 'src/gift-aid/gift-aid-currency';
import { computeClaimBatchRollups } from 'src/gift-aid-claims/gift-aid-claim-batch-rollups';
import type { GiftAidClaimGiftRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

const declarationServiceWithValidDeclaration = (): GiftAidDeclarationService =>
  ({
    ensureGiftAidDeclarationForPayload: vi.fn(async (payload) => payload),
    getGiftAidDeclarationById: vi.fn(async () => undefined),
    resolveApplicableGiftAidDeclaration: vi.fn(async () => ({
      id: 'declaration-1',
    })),
  }) as unknown as GiftAidDeclarationService;

const donation = (currencyCode: string) => ({
  donorId: 'person-1',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  giftDate: '2026-11-01',
  giftType: 'DONATION',
  amount: { amountMicros: 100_000_000, currencyCode },
});

const claimGift = (
  id: string,
  giftAidStatus: string,
  currencyCode: string,
  amount: number,
): GiftAidClaimGiftRecord => ({
  id,
  giftAidStatus,
  amount: { amountMicros: amount * 1_000_000, currencyCode },
});

describe('Gift Aid currency rule', () => {
  it('treats only GBP as sterling', () => {
    expect(isSterlingAmount({ currencyCode: 'GBP' })).toBe(true);
    expect(isSterlingAmount({ currencyCode: 'gbp' })).toBe(true);
    expect(isSterlingAmount({ currencyCode: 'EUR' })).toBe(false);
    expect(isSterlingAmount({ currencyCode: '' })).toBe(false);
    expect(isSterlingAmount(null)).toBe(false);
  });

  it('keeps a GBP gift with a valid declaration claimable', async () => {
    const result = await applyGiftAidMetadata(
      declarationServiceWithValidDeclaration(),
      donation('GBP'),
      true,
    );

    expect(result.giftAidStatus).toBe('CLAIMABLE');
  });

  it('sends a foreign-currency gift with a valid declaration to review', async () => {
    const result = await applyGiftAidMetadata(
      declarationServiceWithValidDeclaration(),
      donation('EUR'),
      true,
    );

    expect(result.giftAidStatus).toBe('NEEDS_REVIEW');
    expect(result.giftAidReasonCode).toBe('non_sterling_currency');
    expect(result.giftAidDeclarationId).toBe('declaration-1');
  });

  it('counts only sterling claimable gifts in a claim total and blocks the rest', () => {
    const rollups = computeClaimBatchRollups([
      claimGift('gbp', 'CLAIMABLE', 'GBP', 100),
      claimGift('eur', 'CLAIMABLE', 'EUR', 500),
      claimGift('review', 'NEEDS_REVIEW', 'GBP', 40),
    ]);

    expect(rollups.totalAmount).toEqual({
      amountMicros: 100_000_000,
      currencyCode: 'GBP',
    });
    expect(rollups.blockingIssueCount).toBe(2);
    expect(rollups.hasBlockingIssues).toBe(true);
    expect(rollups.giftCount).toBe(3);
  });
});
