import { describe, expect, it, vi } from 'vitest';
import { applyGiftAidMetadata } from 'src/gift-aid/gift-aid.policy';
import type { GiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';

const createDeclarationServiceMock = (): GiftAidDeclarationService =>
  ({
    ensureGiftAidDeclarationForPayload: vi.fn(async (payload) => payload),
    getGiftAidDeclarationById: vi.fn(async () => undefined),
    resolveApplicableGiftAidDeclaration: vi.fn(async () => undefined),
  }) as unknown as GiftAidDeclarationService;

describe('applyGiftAidMetadata', () => {
  it('marks non-donation gift types as not claimable without resolving declarations', async () => {
    const declarationService = createDeclarationServiceMock();

    const result = await applyGiftAidMetadata(
      declarationService,
      {
        donorId: 'person-123',
        donorFirstName: 'Iris',
        donorLastName: 'Murdoch',
        giftDate: '2026-04-23',
        giftType: 'GIFT_IN_KIND',
        giftAidRequested: true,
        giftAidDeclarationCaptured: true,
        giftAidDeclarationDate: '2026-04-22',
        giftAidDeclarationSource: 'manual_entry',
      },
      true,
    );

    expect(result.giftAidStatus).toBe('NOT_CLAIMABLE');
    expect(result.giftAidReasonCode).toBe('gift_type_not_eligible');
    expect(result.giftAidDeclarationId).toBeUndefined();
    expect(
      declarationService.ensureGiftAidDeclarationForPayload,
    ).not.toHaveBeenCalled();
    expect(
      declarationService.resolveApplicableGiftAidDeclaration,
    ).not.toHaveBeenCalled();
  });
});
