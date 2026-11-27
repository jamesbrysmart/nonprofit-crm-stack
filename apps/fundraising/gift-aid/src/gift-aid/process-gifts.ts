import { CoreApiClient } from 'twenty-client-sdk/core';
import { createGiftAidDeclarationService } from './gift-aid.declarations';
import { applyGiftAidMetadata } from './gift-aid.policy';
import { getOrCreateDraft } from './gift-aid-draft';
import { refreshClaimBatchSummary } from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import type { GiftAidCaptureInput } from './gift-aid.types';

export const processGiftAidGifts = async (
  giftIds: string[],
  client = new CoreApiClient(),
) => {
  const ids = [...new Set(giftIds)];
  if (ids.length === 0) return;

  const { gifts } = await client.query({
    gifts: {
      __args: { first: ids.length, filter: { id: { in: ids } } },
      edges: {
        node: {
          id: true,
          updatedAt: true,
          giftAidIntake: true,
          giftType: true,
          giftDate: true,
          donorId: true,
          donorFirstName: true,
          donorLastName: true,
          amount: { amountMicros: true, currencyCode: true },
          refundedAmount: { amountMicros: true },
          giftAidDeclarationId: true,
          giftAidStatus: true,
          giftAidReasonCode: true,
          giftAidDecisionSource: true,
          giftAidClaimBatch: { id: true, status: true },
        },
      },
    },
  });

  if (!gifts) throw new Error('Reading gifts for Gift Aid returned no result');

  const declarations = createGiftAidDeclarationService(client);
  const draftsToRefresh = new Set<string>();
  let currentDraftId: string | undefined;
  for (const { node: gift } of gifts.edges) {
    const intake = gift.giftAidIntake as (GiftAidCaptureInput & {
      donorIdAtCapture?: string;
    }) | null;
    if (
      !intake ||
      (gift.refundedAmount?.amountMicros ?? 0) > 0 ||
      gift.giftAidClaimBatch?.status === 'FINALIZED' ||
      gift.giftAidDecisionSource === 'MANUAL_OVERRIDE'
    ) {
      continue;
    }

    const result =
      intake.giftAidDeclarationCaptured && intake.donorIdAtCapture !== gift.donorId
        ? { giftAidStatus: 'NEEDS_REVIEW' as const, giftAidReasonCode: 'declaration_donor_mismatch', giftAidDeclarationId: null }
        : await applyGiftAidMetadata(
            declarations,
            {
              ...intake,
              giftId: gift.id,
              giftType: gift.giftType,
              giftDate: gift.giftDate,
              donorId: gift.donorId,
              donorFirstName: gift.donorFirstName,
              donorLastName: gift.donorLastName,
              amount: gift.amount,
            },
            true,
          );
    const declarationId = result.giftAidDeclarationId ?? null;
    let draftId = gift.giftAidClaimBatch?.id;
    if (!draftId && result.giftAidStatus === 'CLAIMABLE') {
      currentDraftId ??= (await getOrCreateDraft(client)).id;
      draftId = currentDraftId;
    }

    if (
      (gift.giftAidDeclarationId ?? null) !== declarationId ||
      gift.giftAidStatus !== result.giftAidStatus ||
      gift.giftAidReasonCode !== result.giftAidReasonCode ||
      gift.giftAidClaimBatch?.id !== draftId
    ) {
      const { updateGifts } = await client.mutation({
        updateGifts: {
          __args: {
            filter: {
              id: { eq: gift.id },
              updatedAt: { eq: gift.updatedAt },
              ...(gift.giftAidClaimBatch
                ? { giftAidClaimBatch: { status: { eq: 'DRAFT' } } }
                : {}),
            },
            data: {
              giftAidDeclarationId: declarationId,
              giftAidStatus: result.giftAidStatus,
              giftAidReasonCode: result.giftAidReasonCode,
              giftAidDecisionSource: 'SYSTEM',
              giftAidLastEvaluatedAt: new Date().toISOString(),
              ...(draftId ? { giftAidClaimBatchId: draftId } : {}),
            },
          },
          id: true,
        },
      });
      if (updateGifts?.length !== 1) {
        throw new Error(`Gift ${gift.id} changed during Gift Aid evaluation`);
      }
    }

    // Replay still refreshes the summary if the original job stopped after linking the gift.
    if (draftId) draftsToRefresh.add(draftId);
  }

  for (const draftId of draftsToRefresh) {
    await refreshClaimBatchSummary(client, draftId);
  }
};
