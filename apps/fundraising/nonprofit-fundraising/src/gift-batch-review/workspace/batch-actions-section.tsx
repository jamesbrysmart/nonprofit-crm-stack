import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
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
import {
  ActionButton,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import {
  WorkspaceSection,
  WorkspaceText,
  type GiftBatchWorkspaceSectionProps,
} from 'src/gift-batch-review/workspace/workspace-section';

const buildDonorMatchSummary = (input: RunBatchDonorMatchResponse) => {
  const sentences: string[] = [];

  if (input.alreadyConfirmedRows > 0) {
    sentences.push(
      `${input.alreadyConfirmedRows} row${input.alreadyConfirmedRows === 1 ? '' : 's'} already had confirmed donor match${input.alreadyConfirmedRows === 1 ? '' : 'es'}.`,
    );
  }

  if (input.autoLinkedRows > 0) {
    sentences.push(
      `${input.autoLinkedRows} exact donor match${input.autoLinkedRows === 1 ? '' : 'es'} linked.`,
    );
  }

  if (input.ambiguousRows > 0) {
    sentences.push(
      `Review ${input.ambiguousRows} possible donor match${input.ambiguousRows === 1 ? '' : 'es'}.`,
    );
  }

  if (input.unchangedRows > 0) {
    sentences.push(
      `${input.unchangedRows} row${input.unchangedRows === 1 ? '' : 's'} had no confident donor match.`,
    );
  }

  return {
    headline:
      sentences.length > 0
        ? sentences.join(' ')
        : 'No donor matches were found.',
    nextStep:
      input.ambiguousRows > 0
        ? 'Open Review possible donor matches to resolve likely matches before checking the batch.'
        : input.unchangedRows > 0
          ? 'Open Needs review to check rows with no confident donor match.'
          : null,
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

export const BatchActionsSection = ({
  recordId,
  record,
  onChanged,
}: GiftBatchWorkspaceSectionProps) => {
  const [processing, setProcessing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [matchingDonors, setMatchingDonors] = useState(false);
  const [lastRun, setLastRun] = useState<ProcessBatchResponse | null>(null);
  const [lastDonorMatchRun, setLastDonorMatchRun] =
    useState<RunBatchDonorMatchResponse | null>(null);
  const [lastCheckRun, setLastCheckRun] = useState<CheckBatchResponse | null>(
    null,
  );

  const donorMatchSummary = lastDonorMatchRun
    ? buildDonorMatchSummary(lastDonorMatchRun)
    : null;
  const checkBatchSummary = lastCheckRun
    ? buildCheckBatchSummary(lastCheckRun)
    : null;
  const isOverWorkflowLimit = record.isOverWorkflowLimit;
  const isBusy = checking || matchingDonors || processing;
  const actionsDisabled =
    isBusy || record.rows.length === 0 || isOverWorkflowLimit;

  const runAction = async <TResult,>({
    setRunning,
    run,
    onResult,
    failureMessage,
  }: {
    setRunning: (running: boolean) => void;
    run: () => Promise<TResult>;
    onResult: (result: TResult) => Promise<void>;
    failureMessage: string;
  }) => {
    setRunning(true);

    try {
      await onResult(await run());
      await onChanged();
    } catch (actionError) {
      await enqueueSnackbar({
        message:
          actionError instanceof Error ? actionError.message : failureMessage,
        variant: 'error',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleRunDonorMatch = () =>
    runAction({
      setRunning: setMatchingDonors,
      run: () => runBatchDonorMatch({ giftBatchId: recordId }),
      onResult: async (result) => {
        setLastDonorMatchRun(result);
        setLastCheckRun(null);
        await enqueueSnackbar({
          message: buildDonorMatchSummary(result).headline,
          variant: 'success',
        });
      },
      failureMessage: 'Unable to run donor match.',
    });

  const handleCheckBatch = () =>
    runAction({
      setRunning: setChecking,
      run: () => checkBatch({ giftBatchId: recordId }),
      onResult: async (result) => {
        setLastCheckRun(result);
        const countMessage =
          result.expectedItemCount === null
            ? `${result.actualItemCount} rows in batch.`
            : `${result.actualItemCount} of ${result.expectedItemCount} expected rows.`;
        await enqueueSnackbar({
          message: `Batch checked: ${result.readyItems} ready, ${result.needsReviewItems} need review, ${result.failedItems} failed previously. ${countMessage}`,
          variant: 'success',
        });
      },
      failureMessage: 'Unable to check batch.',
    });

  const handleProcessBatch = () =>
    runAction({
      setRunning: setProcessing,
      run: () => processBatch({ giftBatchId: recordId }),
      onResult: async (result) => {
        setLastRun(result);
        setLastCheckRun(null);
        await enqueueSnackbar({
          message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
          variant: 'success',
        });
      },
      failureMessage: 'Unable to process batch.',
    });

  return (
    <WorkspaceSection title="Batch actions">
      <WorkspaceText color="primary">
        {isOverWorkflowLimit
          ? 'Split this batch before running donor match, readiness checks, or processing.'
          : 'Run donor match first, then check the batch before processing the rows that are ready.'}
      </WorkspaceText>
      <div style={actionRowStyle}>
        <ActionButton
          title={matchingDonors ? '1. Matching...' : '1. Run donor match'}
          variant="secondary"
          onClick={() => {
            void handleRunDonorMatch();
          }}
          disabled={actionsDisabled}
        />
        <ActionButton
          title={checking ? '2. Checking...' : '2. Check batch'}
          variant="secondary"
          onClick={() => {
            void handleCheckBatch();
          }}
          disabled={actionsDisabled}
        />
        <ActionButton
          title={processing ? '3. Processing...' : '3. Process batch'}
          variant="primary"
          onClick={() => {
            void handleProcessBatch();
          }}
          disabled={actionsDisabled}
        />
      </div>

      {lastCheckRun && checkBatchSummary ? (
        <>
          <WorkspaceText>{checkBatchSummary.headline}</WorkspaceText>
          {checkBatchSummary.nextStep ? (
            <WorkspaceText>{checkBatchSummary.nextStep}</WorkspaceText>
          ) : null}
          {checkBatchSummary.showExpectationDetail ? (
            <>
              <WorkspaceText>
                Count: {lastCheckRun.actualItemCount}
                {lastCheckRun.expectedItemCount === null
                  ? ''
                  : ` of ${lastCheckRun.expectedItemCount} expected`}
                .
              </WorkspaceText>
              <WorkspaceText>
                Total: {lastCheckRun.actualTotalDisplay}
                {lastCheckRun.expectedTotalDisplay
                  ? ` against expected ${lastCheckRun.expectedTotalDisplay}`
                  : ''}
                .
              </WorkspaceText>
            </>
          ) : null}
        </>
      ) : null}

      {donorMatchSummary ? (
        <>
          <WorkspaceText>{donorMatchSummary.headline}</WorkspaceText>
          {donorMatchSummary.nextStep ? (
            <WorkspaceText>{donorMatchSummary.nextStep}</WorkspaceText>
          ) : null}
        </>
      ) : null}

      {lastRun ? (
        <WorkspaceText>
          Last processing run: {lastRun.processedItems} processed,{' '}
          {lastRun.failedItems} failed, {lastRun.notReadyItems} not ready.
        </WorkspaceText>
      ) : null}
    </WorkspaceSection>
  );
};
