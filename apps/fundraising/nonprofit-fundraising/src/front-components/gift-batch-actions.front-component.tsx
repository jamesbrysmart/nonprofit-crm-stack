import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  compactDividerSectionStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';
import {
  processBatch,
  runBatchDonorMatch,
} from 'src/batch-processing/batch-processing.api';
import type {
  ProcessBatchResponse,
  RunBatchDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';

export const GIFT_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '8f38c33f-3208-4f01-9472-17406eb2279d';

const GiftBatchActions = () => {
  const recordId = useRecordId();
  const { record, loading, error, refresh } = useGiftBatchReview(recordId);
  const [processing, setProcessing] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState(false);
  const [lastRun, setLastRun] = useState<ProcessBatchResponse | null>(null);
  const [lastDonorMatchRun, setLastDonorMatchRun] =
    useState<RunBatchDonorMatchResponse | null>(null);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading batch actions...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const handleRunDonorMatch = async () => {
    setMatchingDonors(true);

    try {
      const result = await runBatchDonorMatch({
        giftBatchId: recordId,
      });
      setLastDonorMatchRun(result);

      await enqueueSnackbar({
        message: `Donor match complete: ${result.autoLinkedRows} linked, ${result.ambiguousRows} ambiguous, ${result.unchangedRows} still unreviewed.`,
        variant: 'success',
      });

      await refresh();
      broadcastGiftBatchInvalidated(recordId);
    } catch (matchError) {
      await enqueueSnackbar({
        message:
          matchError instanceof Error
            ? matchError.message
            : 'Unable to run donor match.',
        variant: 'error',
      });
    } finally {
      setMatchingDonors(false);
    }
  };

  const handleProcessBatch = async () => {
    setProcessing(true);

    try {
      const result = await processBatch({
        giftBatchId: recordId,
      });
      setLastRun(result);

      await enqueueSnackbar({
        message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
        variant: 'success',
      });

      await refresh();
      broadcastGiftBatchInvalidated(recordId);
    } catch (processError) {
      await enqueueSnackbar({
        message:
          processError instanceof Error
            ? processError.message
            : 'Unable to process batch.',
        variant: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        Run donor match before processing if this batch still needs donor review.
      </div>

      <div style={actionRowStyle}>
        <Button
          title={matchingDonors ? 'Matching...' : 'Run donor match'}
          variant="secondary"
          onClick={() => {
            void handleRunDonorMatch();
          }}
          disabled={matchingDonors || processing || record.rows.length === 0}
        />
        <Button
          title={processing ? 'Processing...' : 'Process batch'}
          variant="primary"
          onClick={() => {
            void handleProcessBatch();
          }}
          disabled={processing || matchingDonors || record.rows.length === 0}
        />
      </div>

      {lastDonorMatchRun ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            Last donor match: {lastDonorMatchRun.autoLinkedRows} linked,{' '}
            {lastDonorMatchRun.ambiguousRows} ambiguous,{' '}
            {lastDonorMatchRun.unchangedRows} still unreviewed.
          </div>
          <div style={secondaryTextStyle}>
            Evaluated {lastDonorMatchRun.evaluatedRows} of{' '}
            {lastDonorMatchRun.totalCandidateRows} candidate rows.
          </div>
        </div>
      ) : null}

      {lastRun ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            Last processing run: {lastRun.processedItems} processed,{' '}
            {lastRun.failedItems} failed, {lastRun.notReadyItems} not ready.
          </div>
          <div style={secondaryTextStyle}>
            {lastRun.chunkCount} chunk{lastRun.chunkCount === 1 ? '' : 's'} in
            this run.
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-actions',
  description: 'Primary review and processing actions for a gift batch.',
  component: GiftBatchActions,
});
