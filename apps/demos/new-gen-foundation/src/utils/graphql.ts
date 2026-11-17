// Raw GraphQL against the core API with the logic function's runtime token, for
// generic code (seeding, counters) that works across objects by name.
export const graphql = async <TData>(query: string, variables: Record<string, unknown> = {}): Promise<TData> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_APP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await response.json()) as { data?: TData; errors?: Array<{ message: string }> };
  if (!response.ok || body.errors?.length) {
    throw new Error(`GraphQL error: ${JSON.stringify(body.errors ?? response.statusText)}`);
  }
  return body.data as TData;
};
