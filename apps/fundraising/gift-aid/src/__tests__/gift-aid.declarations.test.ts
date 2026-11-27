import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';
import { createGiftAidDeclarationService } from 'src/gift-aid/gift-aid.declarations';

const activeDeclaration = {
  id: 'declaration-1',
  person: { id: 'donor-1' },
  status: 'ACTIVE',
  declarationDate: '2026-04-22',
};

const connection = (...records: unknown[]) => ({
  giftAidDeclarations: {
    edges: records.map((node) => ({ node })),
    pageInfo: { hasNextPage: false },
  },
});

const capturedGift = {
  giftId: 'gift-1',
  donorId: 'donor-1',
  donorFirstName: 'Ada',
  donorLastName: 'Lovelace',
  giftDate: '2026-04-22',
  giftAidRequested: true,
  giftAidDeclarationCaptured: true,
  giftAidDeclarationDate: '2026-04-22',
};

describe('Gift Aid declarations', () => {
  it.each([
    { status: 'REVOKED' },
    { revokedAt: '2026-05-01' },
    { declarationDate: '2026-04-23' },
    { declarationDate: null },
    { person: { id: 'another-donor' } },
  ])('rejects an unusable declaration through either lookup path (%o)', async (changes) => {
    const query = vi.fn().mockResolvedValue(connection({ ...activeDeclaration, ...changes }));
    const client = { query } as unknown as CoreApiClient;
    const service = createGiftAidDeclarationService(client);

    expect(await service.resolveApplicableGiftAidDeclaration(capturedGift)).toBeUndefined();
    expect(
      await service.resolveApplicableGiftAidDeclaration({
        ...capturedGift,
        giftAidDeclarationId: activeDeclaration.id,
      }),
    ).toBeUndefined();
  });

  it('recovers an already committed declaration after a lost create response', async () => {
    const recovered = { ...activeDeclaration, id: capturedGift.giftId };
    const query = vi.fn()
      .mockResolvedValueOnce(connection())
      .mockResolvedValueOnce(connection(recovered));
    const mutation = vi.fn<(selection: CoreSchema.MutationGenqlSelection) => Promise<never>>()
      .mockRejectedValue(new Error('Connection lost'));
    const client = { query, mutation } as unknown as CoreApiClient;

    const service = createGiftAidDeclarationService(client);
    expect(await service.ensureGiftAidDeclarationForPayload(capturedGift)).toMatchObject({
      giftAidDeclarationId: capturedGift.giftId,
    });
    expect(await service.ensureGiftAidDeclarationForPayload(capturedGift)).toMatchObject({
      giftAidDeclarationId: capturedGift.giftId,
    });
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation.mock.calls[0]?.[0].createGiftAidDeclaration).toMatchObject({
      __args: { data: { id: capturedGift.giftId, personId: capturedGift.donorId } },
    });
  });
});
