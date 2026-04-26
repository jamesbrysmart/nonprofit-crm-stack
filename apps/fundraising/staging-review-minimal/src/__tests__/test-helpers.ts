import { CoreApiClient } from 'twenty-client-sdk/core';

const getApiConfig = () => {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('TWENTY_API_URL and TWENTY_API_KEY must be set for integration tests');
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    apiKey,
  };
};

export const callAppRoute = async <TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> => {
  const { apiUrl, apiKey } = getApiConfig();
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Route call failed with status ${response.status}`);
  }

  return JSON.parse(rawBody) as TResponse;
};

export const loadBatchByName = async (batchName: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftBatches: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          totalItems: true,
          processedItems: true,
          failedItems: true,
        },
      },
    },
  } as any);

  const batch = result?.giftBatches?.edges
    ?.map((edge: { node: unknown }) => edge.node)
    .find((node: { name?: string }) => node.name === batchName);

  if (!batch) {
    throw new Error(`Batch "${batchName}" not found`);
  }

  return batch as {
    id: string;
    name: string;
    status: string;
    totalItems: number;
    processedItems: number;
    failedItems: number;
  };
};

export const loadBatchRows = async (giftBatchId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    stagingReviewItems: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
          processingStatus: true,
          errorDetail: true,
          amount: true,
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

  return (
    result?.stagingReviewItems?.edges
      ?.map((edge: { node: unknown }) => edge.node)
      .filter(
        (node: { giftBatch?: { id?: string } | null }) =>
          node.giftBatch?.id === giftBatchId,
      ) ?? []
  ) as Array<{
    id: string;
    name: string;
    processingStatus: string | null;
    errorDetail: string | null;
    amount: string;
    committedGift: { id: string; name?: string | null } | null;
  }>;
};

export const loadStagingRowByName = async (rowName: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    stagingReviewItems: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
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

  const row = result?.stagingReviewItems?.edges
    ?.map((edge: { node: unknown }) => edge.node)
    .find((node: { name?: string }) => node.name === rowName);

  if (!row) {
    throw new Error(`Staging row "${rowName}" not found`);
  }

  return row as {
    id: string;
    name: string;
    processingStatus: string | null;
    errorDetail: string | null;
    committedGift: { id: string; name?: string | null } | null;
  };
};

export const loadGiftById = async (giftId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: giftId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      giftAidStatus: true,
      giftAidReasonCode: true,
      giftAidDecisionSource: true,
      giftAidClaimBatch: {
        id: true,
        status: true,
      },
      giftAidDeclaration: {
        id: true,
        status: true,
      },
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
    },
  } as any);

  return result?.gift ?? null;
};

export const loadCurrentGiftAidClaimBatch = async () => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 10,
        filter: {
          status: {
            eq: 'DRAFT',
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          giftCount: true,
        },
      },
    },
  } as any);

  return result?.giftAidClaimBatches?.edges?.[0]?.node ?? null;
};

export const loadGiftAidDeclarationsForPerson = async (personId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 50,
        filter: {
          personId: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          status: true,
          statusReason: true,
          declarationDate: true,
          coverageScope: true,
          source: true,
          textVersion: true,
          person: {
            id: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: unknown }) => edge.node,
    ) ?? []
  ) as Array<{
    id: string;
    status?: string | null;
    statusReason?: string | null;
    declarationDate?: string | null;
    coverageScope?: string | null;
    source?: string | null;
    textVersion?: string | null;
    person?: {
      id?: string | null;
    } | null;
  }>;
};

export const loadPeopleByName = async (
  firstName: string,
  lastName: string,
) => {
  const client = new CoreApiClient();
  const result = await client.query({
    people: {
      __args: {
        first: 50,
        filter: {
          and: [
            {
              name: {
                firstName: {
                  eq: firstName,
                },
              },
            },
            {
              name: {
                lastName: {
                  eq: lastName,
                },
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.people?.edges?.map((edge: { node: unknown }) => edge.node) ?? []
  ) as Array<{
    id: string;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    emails?: {
      primaryEmail?: string | null;
    } | null;
  }>;
};
