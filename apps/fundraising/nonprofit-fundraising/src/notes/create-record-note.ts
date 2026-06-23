import { CoreApiClient } from 'twenty-client-sdk/core';
import { extractMutationRecord } from 'src/core-api/core-api-results';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const buildPlainTextBlocknote = (text: string) =>
  JSON.stringify([
    {
      id: `block-${Date.now()}`,
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [{ type: 'text', text, styles: {} }],
      children: [],
    },
  ]);

export const createRecordNote = async (
  client: CoreApiClient,
  args: {
    title: string;
    body: string;
    targetIdFieldName: string;
    targetRecordId: string;
  },
) => {
  const title = normalizeString(args.title);
  const body = normalizeString(args.body);
  const targetIdFieldName = normalizeString(args.targetIdFieldName);
  const targetRecordId = normalizeString(args.targetRecordId);

  if (title === '') {
    throw new Error('Note title is required');
  }

  if (body === '') {
    throw new Error('Note body is required');
  }

  if (targetIdFieldName === '' || targetRecordId === '') {
    throw new Error('Note target is required');
  }

  const noteResult = await client.mutation({
    createNote: {
      __args: {
        data: {
          title,
          bodyV2: {
            blocknote: buildPlainTextBlocknote(body),
            markdown: body,
          },
        },
      },
      id: true,
    },
  } as any);

  const noteId = normalizeString(
    extractMutationRecord<{ id?: string | null }>(noteResult, 'createNote')?.id,
  );

  if (noteId === '') {
    throw new Error('Note creation did not return an id.');
  }

  await client.mutation({
    createNoteTarget: {
      __args: {
        data: {
          noteId,
          [targetIdFieldName]: targetRecordId,
        },
      },
      id: true,
    },
  } as any);

  return noteId;
};
