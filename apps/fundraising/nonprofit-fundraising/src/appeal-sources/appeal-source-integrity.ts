import type { CoreApiClient } from 'twenty-client-sdk/core';

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

type AppealSourceLookupRecord = {
  id?: string | null;
  name?: string | null;
  appeal?: {
    id?: string | null;
    defaultFund?: {
      id?: string | null;
    } | null;
  } | null;
};

const loadAppealSourceById = async (
  client: CoreApiClient,
  appealSourceId: string,
): Promise<AppealSourceLookupRecord | null> => {
  const result = await client.query({
    appealSource: {
      __args: {
        filter: {
          id: {
            eq: appealSourceId,
          },
        },
      },
      id: true,
      name: true,
      appeal: {
        id: true,
        defaultFund: {
          id: true,
        },
      },
    },
  } as any);

  return (result?.appealSource as AppealSourceLookupRecord | null) ?? null;
};

export const resolveAppealSourceSelection = async ({
  client,
  appealId,
  appealSourceId,
}: {
  client: CoreApiClient;
  appealId: string;
  appealSourceId: string;
}) => {
  const normalizedAppealId = normalizeString(appealId);
  const normalizedAppealSourceId = normalizeString(appealSourceId);

  if (normalizedAppealSourceId === '') {
    return {
      appealId: normalizedAppealId,
      appealSourceId: '',
      appealDefaultFundId: '',
    };
  }

  const appealSource = await loadAppealSourceById(client, normalizedAppealSourceId);

  if (!appealSource?.id) {
    throw new Error('Selected appeal source was not found.');
  }

  const parentAppealId = normalizeString(appealSource.appeal?.id);

  if (parentAppealId === '') {
    throw new Error('Selected appeal source is not linked to an appeal.');
  }

  if (
    normalizedAppealId !== '' &&
    normalizedAppealId !== parentAppealId
  ) {
    throw new Error(
      'Selected appeal source does not belong to the selected appeal.',
    );
  }

  return {
    appealId: normalizedAppealId === '' ? parentAppealId : normalizedAppealId,
    appealSourceId: normalizedAppealSourceId,
    appealDefaultFundId: normalizeString(
      appealSource.appeal?.defaultFund?.id,
    ),
  };
};
