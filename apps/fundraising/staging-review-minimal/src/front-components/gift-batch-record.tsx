import { useEffect, useState, type CSSProperties } from 'react';
import {
  defineFrontComponent,
  enqueueSnackbar,
  useRecordId,
} from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { processBatch } from 'src/batch-processing/batch-processing.api';
import type {
  BatchReviewRow,
  BatchSummaryRecord,
  ProcessBatchResponse,
} from 'src/batch-processing/batch-processing.types';

export const GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '3efdb48e-e83f-4f59-a43d-a86eb06eea2d';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const buttonBaseStyle: CSSProperties = {
  borderRadius: '6px',
  padding: '10px 14px',
  font: 'inherit',
  cursor: 'pointer',
};

const primaryButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: 'none',
  background: '#1f6feb',
  color: '#ffffff',
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: '1px solid #d0d7de',
  background: '#ffffff',
  color: '#1f2328',
};

const loadBatchRecord = async (
  recordId: string,
): Promise<{
  batch: BatchSummaryRecord | null;
  rows: BatchReviewRow[];
}> => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftBatch: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      status: true,
      totalItems: true,
      processedItems: true,
      failedItems: true,
    },
    stagingReviewItems: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          amount: true,
          giftDate: true,
          donorResolutionState: true,
          donor: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          },
          hasCoreGiftIssue: true,
          isReadyForProcessing: true,
          processingStatus: true,
          errorDetail: true,
          committedGift: {
            id: true,
            name: true,
          },
          giftBatch: {
            id: true,
          },
        },
      },
    },
  } as any);

  const rows =
    result?.stagingReviewItems?.edges
      ?.map((edge: { node: BatchReviewRow }) => edge.node)
      .filter((row: BatchReviewRow) => row.giftBatch?.id === recordId) ?? [];

  return {
    batch: (result?.giftBatch as BatchSummaryRecord | null) ?? null,
    rows,
  };
};

const getRowStatusSummary = (row: BatchReviewRow) => {
  const donorName = `${row.donorFirstName ?? ''} ${row.donorLastName ?? ''}`.trim();
  const linkedDonor =
    row.donor?.name?.firstName || row.donor?.name?.lastName
      ? `${row.donor?.name?.firstName ?? ''} ${row.donor?.name?.lastName ?? ''}`.trim()
      : 'No linked donor';

  return {
    donorName: donorName || 'Unknown donor',
    linkedDonor,
    status: row.processingStatus ?? 'NOT_READY',
    canProcess: Boolean(
      row.processingStatus !== 'PROCESSED' &&
      row.isReadyForProcessing === true &&
      row.hasCoreGiftIssue !== true &&
      row.donorResolutionState === 'CONFIRMED' &&
      row.donor !== null,
    ),
  };
};

const GiftBatchRecord = () => {
  const recordId = useRecordId();
  const [batch, setBatch] = useState<BatchSummaryRecord | null>(null);
  const [rows, setRows] = useState<BatchReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<ProcessBatchResponse | null>(null);

  const refresh = async () => {
    if (!recordId) {
      setError('No batch selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loadBatchRecord(recordId);

      if (!result.batch) {
        setBatch(null);
        setRows([]);
        setError('Batch not found');
        return;
      }

      setBatch(result.batch);
      setRows(result.rows);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load batch',
      );
      setBatch(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [recordId]);

  const handleProcessBatch = async () => {
    if (!recordId) {
      return;
    }

    setProcessing(true);

    try {
      const result = await processBatch({
        giftBatchId: recordId,
      });
      setLastRun(result);

      await enqueueSnackbar({
        message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} still not ready.`,
        variant: 'success',
      });
      await refresh();
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

  if (loading) {
    return <div style={secondaryTextStyle}>Loading batch scope...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!batch) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'sans-serif',
        display: 'grid',
        gap: '16px',
      }}
    >
      <div style={cardStyle}>
        <div style={{ fontSize: '20px', fontWeight: 600 }}>{batch.name}</div>
        <div style={secondaryTextStyle}>
          Focused batch scope for staged gift processing.
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>Status: {batch.status}</div>
          <div>Total: {batch.totalItems}</div>
          <div>Processed: {batch.processedItems}</div>
          <div>Failed: {batch.failedItems}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={primaryButtonStyle}
            onClick={() => void handleProcessBatch()}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Process batch'}
          </button>
          <button
            style={secondaryButtonStyle}
            onClick={() => void refresh()}
            disabled={processing}
          >
            Refresh
          </button>
        </div>
      </div>

      {lastRun ? (
        <div style={cardStyle}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            Last processing run
          </div>
          <div style={secondaryTextStyle}>
            Early bounded executor diagnostics for the Twenty-apps spike.
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>Mode: {lastRun.executorMode}</div>
            <div>Chunks: {lastRun.chunkCount}</div>
            <div>Batch path processed: {lastRun.batchPathProcessed}</div>
            <div>Batch path failed: {lastRun.batchPathFailed}</div>
            <div>Row fallback processed: {lastRun.rowFallbackProcessed}</div>
            <div>Row fallback failed: {lastRun.rowFallbackFailed}</div>
          </div>
        </div>
      ) : null}

      <div style={cardStyle}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Batch rows</div>
        <div style={secondaryTextStyle}>
          This is the first focused batch scope proof: rows in the selected batch,
          their current readiness, and their processing outcomes.
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {rows.map((row) => {
            const summary = getRowStatusSummary(row);

            return (
              <div
                key={row.id}
                style={{
                  border: '1px solid #d8dee4',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'grid',
                  gap: '6px',
                }}
              >
                <div style={{ fontWeight: 600 }}>{row.name}</div>
                <div>Donor: {summary.donorName}</div>
                <div>Linked donor: {summary.linkedDonor}</div>
                <div>Amount: {row.amount}</div>
                <div>Processing status: {summary.status}</div>
                <div>
                  Readiness:{' '}
                  {summary.canProcess ? 'Ready for batch processing' : 'Needs review'}
                </div>
                {row.committedGift ? (
                  <div>Committed gift: {row.committedGift.name ?? row.committedGift.id}</div>
                ) : null}
                {row.errorDetail ? (
                  <div style={{ color: '#cf222e' }}>Error: {row.errorDetail}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-record',
  description:
    'Focused batch processing surface for staged gift processing proof.',
  component: GiftBatchRecord,
});
