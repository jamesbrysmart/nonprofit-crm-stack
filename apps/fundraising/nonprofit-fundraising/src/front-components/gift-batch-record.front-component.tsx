import { useEffect, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { Button } from 'twenty-sdk/ui';
import { processBatch } from 'src/batch-processing/batch-processing.api';
import type { ProcessBatchResponse } from 'src/batch-processing/batch-processing.types';
import { buildGiftBatchReviewRecord } from 'src/gift-batch-review/gift-batch-review.model';
import { processGiftStagingRow } from 'src/gift-staging-review/gift-staging-processing.api';
import type {
  BatchSummaryRecord,
  BatchReviewRow,
  GiftBatchReviewRecord,
} from 'src/gift-batch-review/gift-batch-review.types';

export const GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '869994ef-06ce-41a4-9732-3727e1b4b2c2';

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '10px',
  background: '#ffffff',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const metricValueStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#1f2328',
};

const rowCardStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '8px',
  padding: '12px',
  display: 'grid',
  gap: '6px',
  background: '#ffffff',
};

const actionGridStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const statusPillBaseStyle: CSSProperties = {
  borderRadius: '999px',
  padding: '4px 8px',
  fontSize: '12px',
  fontWeight: 600,
  width: 'fit-content',
};

const getStatusPillStyle = (status: string): CSSProperties => {
  switch (status) {
    case 'READY':
      return {
        ...statusPillBaseStyle,
        background: '#fff8c5',
        color: '#7c5d00',
      };
    case 'PROCESSED':
      return {
        ...statusPillBaseStyle,
        background: '#eef9f0',
        color: '#1a7f37',
      };
    case 'PROCESS_FAILED':
      return {
        ...statusPillBaseStyle,
        background: '#fff5f5',
        color: '#8a2d2d',
      };
    default:
      return {
        ...statusPillBaseStyle,
        background: '#f6f8fa',
        color: '#57606a',
      };
  }
};

type GiftStagingQueueScope =
  | 'all'
  | 'failed'
  | 'not-ready'
  | 'needs-donor-review'
  | 'ready';

const buildGiftStagingQueryParams = (
  batchId: string,
  scope: GiftStagingQueueScope,
): Record<string, string | string[]> => {
  const queryParams: Record<string, string | string[]> = {
    'filter[giftBatch][IS]': [batchId],
  };

  switch (scope) {
    case 'failed':
      queryParams['filter[processingStatus][IS]'] = ['PROCESS_FAILED'];
      break;
    case 'not-ready':
      queryParams['filter[isReadyForProcessing][IS]'] = 'false';
      queryParams['filter[processingStatus][IS_NOT]'] = ['PROCESSED'];
      break;
    case 'needs-donor-review':
      queryParams['filter[donorResolutionState][IS_NOT]'] = ['CONFIRMED'];
      break;
    case 'ready':
      queryParams['filter[isReadyForProcessing][IS]'] = 'true';
      queryParams['filter[processingStatus][IS_NOT]'] = ['PROCESSED'];
      break;
    case 'all':
    default:
      break;
  }

  return queryParams;
};

const loadGiftBatchReview = async (
  recordId: string,
): Promise<GiftBatchReviewRecord | null> => {
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
      source: true,
      status: true,
      totalItems: true,
      processedItems: true,
      failedItems: true,
    },
    giftStagings: {
      __args: {
        first: 200,
        filter: {
          giftBatchId: {
            eq: recordId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          donorFirstName: true,
          donorLastName: true,
          donorEmail: true,
          amount: {
            amountMicros: true,
            currencyCode: true,
          },
          giftDate: true,
          provider: true,
          providerAgreementId: true,
          donorResolutionState: true,
          donor: {
            id: true,
          },
          isReadyForProcessing: true,
          processingStatus: true,
          errorDetail: true,
          committedGift: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  const batch = result?.giftBatch as BatchSummaryRecord | null;

  if (!batch) {
    return null;
  }

  const rows =
    result?.giftStagings?.edges?.map(
      (edge: { node: BatchReviewRow }) => edge.node,
    ) ?? [];

  return buildGiftBatchReviewRecord(batch, rows);
};

const GiftBatchRecord = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftBatchReviewRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState<ProcessBatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRowId, setProcessingRowId] = useState<string | null>(null);

  const refresh = async () => {
    if (!recordId) {
      setError('No batch selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedRecord = await loadGiftBatchReview(recordId);

      if (!loadedRecord) {
        setRecord(null);
        setError('Batch not found');
        return;
      }

      setRecord(loadedRecord);
    } catch (loadError) {
      setRecord(null);
      setError(
        loadError instanceof Error ? loadError.message : 'Unable to load batch',
      );
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
        message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
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

  const handleProcessRow = async (rowId: string, rowName: string) => {
    setProcessingRowId(rowId);

    try {
      const result = await processGiftStagingRow({
        giftStagingId: rowId,
      });

      await enqueueSnackbar({
        message:
          result.processingStatus === 'PROCESSED'
            ? `${rowName} processed successfully.`
            : result.processingStatus === 'PROCESS_FAILED'
              ? result.errorDetail ?? `${rowName} failed during processing.`
              : `${rowName} is not ready for processing.`,
        variant:
          result.processingStatus === 'PROCESSED'
            ? 'success'
            : result.processingStatus === 'PROCESS_FAILED'
              ? 'error'
              : 'info',
      });

      await refresh();
    } catch (processError) {
      await enqueueSnackbar({
        message:
          processError instanceof Error
            ? processError.message
            : 'Unable to process row.',
        variant: 'error',
      });
    } finally {
      setProcessingRowId(null);
    }
  };

  const handleOpenGiftStagingQueue = async (
    scope: GiftStagingQueueScope,
  ) => {
    if (!recordId) {
      return;
    }

    await navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: 'giftStagings',
      },
      buildGiftStagingQueryParams(recordId, scope),
    );
  };

  if (loading) {
    return <div style={secondaryTextStyle}>Loading batch review...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Batch not found.</div>;
  }

  const notReadyItems = record.rows.filter(
    (row) => row.processingStatus !== 'PROCESSED' && !row.isReadyForProcessing,
  ).length;

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
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={labelStyle}>Focused batch scope</div>
          <div style={metricValueStyle}>{record.name}</div>
          <div style={secondaryTextStyle}>
            Batch scope is the focused operational container for related staged
            gifts. Use it to understand the shape of the work before moving
            row-by-row into staging review or processing.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={getStatusPillStyle(record.status)}>{record.status}</div>
          <div style={secondaryTextStyle}>Source: {record.source}</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Total rows</div>
          <div style={metricValueStyle}>{record.totalItems}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Total value</div>
          <div style={metricValueStyle}>{record.totalValueDisplay}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Eligible now</div>
          <div style={metricValueStyle}>{record.eligibleItems}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Ready</div>
          <div style={metricValueStyle}>{record.readyItems}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Needs donor review</div>
          <div style={metricValueStyle}>{record.unresolvedItems}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Failed</div>
          <div style={metricValueStyle}>{record.failedItems}</div>
        </div>
        <div style={cardStyle}>
          <div style={labelStyle}>Processed</div>
          <div style={metricValueStyle}>{record.processedItems}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={labelStyle}>Current slice boundary</div>
          <div style={secondaryTextStyle}>
            Processing is now bounded to this batch scope. The current slice
            keeps the execution model intentionally narrow: one routing pass,
            chunked batch create, split-on-failure, chunked writeback, and a
            final batch summary update.
          </div>
        </div>
        <div>
          <Button
            title={processing ? 'Processing...' : 'Process batch'}
            variant="primary"
            onClick={() => {
              void handleProcessBatch();
            }}
            disabled={processing || record.rows.length === 0}
          />
        </div>
        {lastRun ? (
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={secondaryTextStyle}>
              Last run: {lastRun.processedItems} processed, {lastRun.failedItems}{' '}
              failed, {lastRun.notReadyItems} not ready.
            </div>
            <div style={secondaryTextStyle}>
              Chunks: {lastRun.chunkCount} | Batch path processed:{' '}
              {lastRun.batchPathProcessed} | Batch path failed:{' '}
              {lastRun.batchPathFailed}
            </div>
            <div style={secondaryTextStyle}>
              Row fallback processed: {lastRun.rowFallbackProcessed} | Row
              fallback failed: {lastRun.rowFallbackFailed}
            </div>
          </div>
        ) : null}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={labelStyle}>Open staged-gift worklists</div>
          <div style={secondaryTextStyle}>
            Use native staged-gift views for larger-batch review. Each entry
            keeps the batch filter and adds the specific work scope you want to
            inspect next.
          </div>
        </div>
        <div style={actionGridStyle}>
          <Button
            title={`Open all ${record.totalItems} staged rows`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagingQueue('all');
            }}
          />
          <Button
            title={`Open ${record.failedItems} failed rows`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagingQueue('failed');
            }}
          />
          <Button
            title={`Open ${record.unresolvedItems} rows needing donor review`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagingQueue('needs-donor-review');
            }}
          />
          <Button
            title={`Open ${record.readyItems} ready rows`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagingQueue('ready');
            }}
          />
          <Button
            title={`Open ${notReadyItems} rows not ready`}
            variant="secondary"
            onClick={() => {
              void handleOpenGiftStagingQueue('not-ready');
            }}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={labelStyle}>Quick row scan</div>
          <div style={secondaryTextStyle}>
            Keep this as a compact batch summary. For real exception work, open
            the targeted staged-gift queue above and review the records there.
          </div>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {record.rows.length === 0 ? (
            <div style={secondaryTextStyle}>
              No staged gifts are currently attached to this batch.
            </div>
          ) : (
            record.rows.map((row) => (
              <div key={row.id} style={rowCardStyle}>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>{row.name}</strong>
                  <div
                    style={getStatusPillStyle(
                      row.processingStatus === 'PROCESSED'
                        ? 'PROCESSED'
                        : row.processingStatus === 'PROCESS_FAILED'
                          ? 'PROCESS_FAILED'
                          : row.isReadyForProcessing
                            ? 'READY'
                            : 'NOT_PROCESSED',
                    )}
                  >
                    {row.processingStatus === 'PROCESSED'
                      ? 'PROCESSED'
                      : row.processingStatus === 'PROCESS_FAILED'
                        ? 'PROCESS_FAILED'
                        : row.isReadyForProcessing
                          ? 'READY'
                          : 'NOT_PROCESSED'}
                  </div>
                </div>
                <div style={secondaryTextStyle}>
                  Donor evidence: {row.donorEvidenceName}
                </div>
                <div style={secondaryTextStyle}>Amount: {row.amountDisplay}</div>
                <div style={secondaryTextStyle}>Gift date: {row.giftDate}</div>
                <div style={secondaryTextStyle}>Provider: {row.provider}</div>
                <div style={secondaryTextStyle}>
                  Provider agreement: {row.providerAgreementId}
                </div>
                <div style={secondaryTextStyle}>Email: {row.donorEmail}</div>
                <div style={secondaryTextStyle}>
                  Donor resolution: {row.donorResolutionState}
                </div>
                <div style={secondaryTextStyle}>
                  {row.processingStatus === 'PROCESSED'
                    ? 'Row has already been processed.'
                    : row.donorResolutionState === 'AMBIGUOUS'
                      ? 'Donor ambiguity still blocks this row.'
                      : row.isReadyForProcessing
                        ? 'Row can process now and is also marked ready.'
                        : row.isProcessable
                          ? 'Row can process now but has not been explicitly marked ready.'
                          : 'Row still needs more review before it can process.'}
                </div>
                {row.errorDetail !== '' ? (
                  <div style={secondaryTextStyle}>
                    Error detail: {row.errorDetail}
                  </div>
                ) : null}
                <div style={secondaryTextStyle}>
                  Committed gift: {row.committedGiftName}
                </div>
                <div style={secondaryTextStyle}>
                  Use this row card for quick inspection now; richer navigation
                  to the full staged record can follow once the baseline review
                  loop is stable.
                </div>
                <div>
                  <Button
                    title={
                      processingRowId === row.id ? 'Processing...' : 'Process row'
                    }
                    variant="secondary"
                    onClick={() => {
                      void handleProcessRow(row.id, row.name);
                    }}
                    disabled={
                      processing ||
                      processingRowId !== null ||
                      row.processingStatus === 'PROCESSED'
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_BATCH_RECORD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-batch-record',
  description:
    'Focused record review surface for a gift batch and its staged rows.',
  component: GiftBatchRecord,
});
