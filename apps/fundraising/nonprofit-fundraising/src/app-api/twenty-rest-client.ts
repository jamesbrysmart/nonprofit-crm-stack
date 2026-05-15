const getTwentyRestConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('Twenty REST configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

export const postTwentyRest = async <TResponse>({
  path,
  body,
}: {
  path: string;
  body: unknown;
}): Promise<TResponse> => {
  const { apiBaseUrl, token } = getTwentyRestConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(
      rawBody || `Twenty REST request failed with ${response.status}`,
    );
  }

  if (rawBody.trim() === '') {
    return null as TResponse;
  }

  return JSON.parse(rawBody) as TResponse;
};
