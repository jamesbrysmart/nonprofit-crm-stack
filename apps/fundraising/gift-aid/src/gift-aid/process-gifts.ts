import { CoreApiClient } from 'twenty-client-sdk/core';
import { createGiftAidDeclarationService } from './gift-aid.declarations';
import { applyGiftAidMetadata } from './gift-aid.policy';
import { getOrCreateDraft } from './gift-aid-draft';
import { refreshClaimBatchSummary } from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import type { GiftAidCaptureInput } from './gift-aid.types';

export const processGiftAidGifts = async (
  giftIds: string[],
  client = new CoreApiClient({ runAs: 'application' }),
  previousBatchIds: string[] = [],
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
  // The refund event retains the previous batch ID if a retry finds the
  // Gift already detached but the draft summary still needs refreshing.
  const draftsToRefresh = new Set(previousBatchIds);
  let currentDraftId: string | undefined;
  for (const { node: gift } of gifts.edges) {
    const intake = gift.giftAidIntake as (GiftAidCaptureInput & {
      donorIdAtCapture?: string;
    }) | null;
    if (gift.giftAidClaimBatch?.status === 'FINALIZED') {
      continue;
    }

    const refunded = (gift.refundedAmount?.amountMicros ?? 0) > 0;
    if (
      (!intake && (!refunded || !gift.giftAidClaimBatch)) ||
      (!refunded && gift.giftAidDecisionSource === 'MANUAL_OVERRIDE')
    ) {
      continue;
    }

    const result = refunded
      ? {
          giftAidStatus: 'NOT_CLAIMABLE' as const,
          giftAidReasonCode: 'gift_refunded_or_reversed',
          giftAidDeclarationId: gift.giftAidDeclarationId,
        }
      : intake?.giftAidDeclarationCaptured && intake.donorIdAtCapture !== gift.donorId
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
    const previousBatchId = gift.giftAidClaimBatch?.id;
    let draftId = refunded ? undefined : previousBatchId;
    if (!draftId && result.giftAidStatus === 'CLAIMABLE') {
      currentDraftId ??= (await getOrCreateDraft(client)).id;
      draftId = currentDraftId;
    }

    if (
      (gift.giftAidDeclarationId ?? null) !== declarationId ||
      gift.giftAidStatus !== result.giftAidStatus ||
      gift.giftAidReasonCode !== result.giftAidReasonCode ||
      previousBatchId !== draftId
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
              ...(previousBatchId !== draftId ? { giftAidClaimBatchId: draftId ?? null } : {}),
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
    if (previousBatchId) draftsToRefresh.add(previousBatchId);
    if (draftId) draftsToRefresh.add(draftId);
  }

  for (const draftId of draftsToRefresh) {
    await refreshClaimBatchSummary(client, draftId);
  }
};
