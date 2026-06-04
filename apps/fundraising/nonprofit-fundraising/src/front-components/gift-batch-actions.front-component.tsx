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
  checkBatch,
  processBatch,
  runBatchDonorMatch,
} from 'src/batch-processing/batch-processing.api';
import type {
  CheckBatchResponse,
  ProcessBatchResponse,
  RunBatchDonorMatchResponse,
} from 'src/batch-processing/batch-processing.types';
import { useGiftBatchReview } from 'src/gift-batch-review/use-gift-batch-review';
import { broadcastGiftBatchInvalidated } from 'src/gift-batch-review/gift-batch-sync';

export const GIFT_BATCH_ACTIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '8f38c33f-3208-4f01-9472-17406eb2279d';

const buildDonorMatchSummary = (input: RunBatchDonorMatchResponse) => {
  const linkedLabel =
    input.autoLinkedRows === 1
      ? '1 row was linked automatically.'
      : `${input.autoLinkedRows} rows were linked automatically.`;

  if (input.ambiguousRows > 0) {
    return {
      headline: `Donor match complete. ${linkedLabel}`,
      nextStep: `Open Needs review to finish ${input.ambiguousRows} ambiguous match${input.ambiguousRows === 1 ? '' : 'es'}.`,
    };
  }

  if (input.unchangedRows > 0) {
    return {
      headline: `Donor match complete. ${linkedLabel}`,
      nextStep: `Open Needs review to check ${input.unchangedRows} remaining row${input.unchangedRows === 1 ? '' : 's'}.`,
    };
  }

  return {
    headline: `Donor match complete. ${linkedLabel}`,
    nextStep: null,
  };
};

const buildCheckBatchSummary = (input: CheckBatchResponse) => {
  const headline = `Batch checked. ${input.readyItems} ${input.readyItems === 1 ? 'row is' : 'rows are'} ready to process and ${input.needsReviewItems} ${input.needsReviewItems === 1 ? 'still needs' : 'still need'} review.`;

  if (input.needsReviewItems > 0) {
    return {
      headline,
      nextStep:
        'Open Needs review to fix the remaining rows, or process the ready rows now.',
      showExpectationDetail: false,
    };
  }

  return {
    headline,
    nextStep:
      input.readyItems > 0
        ? 'You can process the ready rows now.'
        : null,
    showExpectationDetail:
      input.itemCountMatchesExpected === false ||
      input.totalMatchesExpected === false,
  };
};

const GiftBatchActions = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftBatchReview(recordId);
  const [processing, setProcessing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState(false);
  const [lastRun, setLastRun] = useState<ProcessBatchResponse | null>(null);
  const [lastDonorMatchRun, setLastDonorMatchRun] =
    useState<RunBatchDonorMatchResponse | null>(null);
  const [lastCheckRun, setLastCheckRun] = useState<CheckBatchResponse | null>(
    null,
  );

  if (loading && !record) {
    return <div style={secondaryTextStyle}>Loading batch actions...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const donorMatchSummary = lastDonorMatchRun
    ? buildDonorMatchSummary(lastDonorMatchRun)
    : null;
  const checkBatchSummary = lastCheckRun
    ? buildCheckBatchSummary(lastCheckRun)
    : null;
  const isOverWorkflowLimit = record.isOverWorkflowLimit;

  const handleRunDonorMatch = async () => {
    setMatchingDonors(true);

    try {
      const result = await runBatchDonorMatch({
        giftBatchId: recordId,
      });
      setLastDonorMatchRun(result);
      setLastCheckRun(null);

      await enqueueSnackbar({
        message: `Donor match complete: ${result.autoLinkedRows} linked, ${result.ambiguousRows} ambiguous, ${result.unchangedRows} still unreviewed.`,
        variant: 'success',
      });

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
      setLastCheckRun(null);

      await enqueueSnackbar({
        message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
        variant: 'success',
      });

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

  const handleCheckBatch = async () => {
    setChecking(true);

    try {
      const result = await checkBatch({
        giftBatchId: recordId,
      });
      setLastCheckRun(result);

      const countMessage =
        result.expectedItemCount === null
          ? `${result.actualItemCount} rows in batch.`
          : `${result.actualItemCount} of ${result.expectedItemCount} expected rows.`;

      await enqueueSnackbar({
        message: `Batch checked: ${result.readyItems} ready, ${result.needsReviewItems} need review, ${result.failedItems} failed previously. ${countMessage}`,
        variant: 'success',
      });

      broadcastGiftBatchInvalidated(recordId);
    } catch (checkError) {
      await enqueueSnackbar({
        message:
          checkError instanceof Error
            ? checkError.message
            : 'Unable to check batch.',
        variant: 'error',
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {isOverWorkflowLimit
          ? record.workflowLimitMessage
          : 'Run donor match first, then check the batch before processing the rows that are ready.'}
      </div>

      <div style={actionRowStyle}>
        <Button
          title={matchingDonors ? '1. Matching...' : '1. Run donor match'}
          variant="secondary"
          onClick={() => {
            void handleRunDonorMatch();
          }}
          disabled={
            checking ||
            matchingDonors ||
            processing ||
            record.rows.length === 0 ||
            isOverWorkflowLimit
          }
        />
        <Button
          title={checking ? '2. Checking...' : '2. Check batch'}
          variant="secondary"
          onClick={() => {
            void handleCheckBatch();
          }}
          disabled={
            checking ||
            matchingDonors ||
            processing ||
            record.rows.length === 0 ||
            isOverWorkflowLimit
          }
        />
        <Button
          title={processing ? '3. Processing...' : '3. Process batch'}
          variant="primary"
          onClick={() => {
            void handleProcessBatch();
          }}
          disabled={
            checking ||
            processing ||
            matchingDonors ||
            record.rows.length === 0 ||
            isOverWorkflowLimit
          }
        />
      </div>

      {lastCheckRun ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            {checkBatchSummary?.headline}
          </div>
          {checkBatchSummary?.nextStep ? (
            <div style={secondaryTextStyle}>{checkBatchSummary.nextStep}</div>
          ) : null}
          {checkBatchSummary?.showExpectationDetail ? (
            <>
              <div style={secondaryTextStyle}>
                Count: {lastCheckRun.actualItemCount}
                {lastCheckRun.expectedItemCount === null
                  ? ''
                  : ` of ${lastCheckRun.expectedItemCount} expected`}
                .
              </div>
              <div style={secondaryTextStyle}>
                Total: {lastCheckRun.actualTotalDisplay}
                {lastCheckRun.expectedTotalDisplay
                  ? ` against expected ${lastCheckRun.expectedTotalDisplay}`
                  : ''}
                .
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {lastDonorMatchRun ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            {donorMatchSummary?.headline}
          </div>
          {donorMatchSummary?.nextStep ? (
            <div style={secondaryTextStyle}>{donorMatchSummary.nextStep}</div>
          ) : null}
        </div>
      ) : null}

      {lastRun ? (
        <div style={compactDividerSectionStyle}>
          <div style={secondaryTextStyle}>
            Last processing run: {lastRun.processedItems} processed,{' '}
            {lastRun.failedItems} failed, {lastRun.notReadyItems} not ready.
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
