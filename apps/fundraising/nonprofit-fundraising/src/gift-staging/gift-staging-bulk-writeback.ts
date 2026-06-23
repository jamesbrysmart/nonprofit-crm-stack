import { postTwentyRest } from 'src/app-api/twenty-rest-client';

const DEFAULT_CHUNK_SIZE = 60;
const DEFAULT_CHUNK_DELAY_MS = 700;

export type GiftStagingUpsertRecord = {
  id: string;
  [key: string]: unknown;
};

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new Error('Chunk size must be greater than zero');
  }

  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const sleep = async (delayMs: number) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

const normalizeId = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

export const upsertGiftStagingBatch = async (
  records: GiftStagingUpsertRecord[],
  allowedIds?: Set<string>,
) => {
  if (records.length === 0) {
    throw new Error('Gift staging upsert batch cannot be empty');
  }

  if (records.length > DEFAULT_CHUNK_SIZE) {
    throw new Error(
      `Gift staging upsert batch exceeds ${DEFAULT_CHUNK_SIZE} records`,
    );
  }

  const expectedIds = new Set<string>();
  const persistedChunk = records.map((record) => {
    const id = normalizeId(record.id);

    if (id === '') {
      throw new Error('Gift staging upsert record id is required');
    }

    if (expectedIds.has(id)) {
      throw new Error(`Gift staging upsert batch includes duplicate id ${id}`);
    }

    if (allowedIds && !allowedIds.has(id)) {
      throw new Error(`Gift staging upsert batch includes unexpected id ${id}`);
    }

    const { id: _ignoredId, ...rest } = record;
    const payloadEntries = Object.entries(rest).filter(
      ([, value]) => value !== undefined,
    );

    if (payloadEntries.length === 0) {
      throw new Error(`Gift staging upsert for ${id} has no fields to write`);
    }

    expectedIds.add(id);

    return {
      id,
      ...Object.fromEntries(payloadEntries),
    };
  });

  const response = await postTwentyRest<unknown>({
    path: '/rest/batch/giftStagings?upsert=true&depth=0',
    body: persistedChunk,
  });

  const body =
    response && typeof response === 'object'
      ? (response as {
          data?: { createGiftStagings?: Array<{ id?: unknown }> };
        })
      : undefined;

  const returnedIds = new Set(
    (Array.isArray(body?.data?.createGiftStagings)
      ? body.data.createGiftStagings
      : []
    )
      .map((record) => normalizeId(record?.id))
      .filter((id): id is string => id !== ''),
  );

  if (returnedIds.size !== expectedIds.size) {
    throw new Error('Batch staging writeback returned unexpected id count');
  }

  for (const id of expectedIds) {
    if (!returnedIds.has(id)) {
      throw new Error(`Batch staging writeback missing id ${id}`);
    }
  }
};

export const persistGiftStagingBatchUpserts = async (
  records: GiftStagingUpsertRecord[],
  options?: {
    allowedIds?: Set<string>;
    chunkSize?: number;
    delayMs?: number;
  },
) => {
  if (records.length === 0) {
    return;
  }

  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const delayMs = options?.delayMs ?? DEFAULT_CHUNK_DELAY_MS;
  const chunks = chunkArray(records, chunkSize);

  for (let index = 0; index < chunks.length; index += 1) {
    await upsertGiftStagingBatch(chunks[index], options?.allowedIds);

    if (index < chunks.length - 1) {
      await sleep(delayMs);
    }
  }
};
