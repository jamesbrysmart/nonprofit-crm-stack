const getAppApiConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('App API configuration missing');
  }

  return {
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    token,
  };
};

const containsHtmlDocument = (message: string) =>
  /<!doctype\s+html/i.test(message) || /<html[\s>]/i.test(message);

const isCloudflareGatewayMessage = (message: string) => {
  if (
    message.includes('Cloudflare') ||
    message.includes('Bad Gateway') ||
    message.includes('origin_bad_gateway')
  ) {
    return true;
  }

  try {
    const parsed = JSON.parse(message) as {
      cloudflare_error?: unknown;
      error_code?: unknown;
      error_name?: unknown;
      status?: unknown;
    };

    return (
      parsed.cloudflare_error === true ||
      parsed.error_code === 502 ||
      parsed.error_name === 'origin_bad_gateway' ||
      parsed.status === 502
    );
  } catch {
    return false;
  }
};

const extractRouteErrorMessage = (rawBody: string, status: number) => {
  const fallback = `Request failed with status ${status}`;
  const trimmedBody = rawBody.trim();

  if (!trimmedBody) {
    return fallback;
  }

  let message = trimmedBody;
  let errorCode = '';

  try {
    const parsed = JSON.parse(trimmedBody) as {
      messages?: unknown;
      message?: unknown;
      error?: unknown;
      code?: unknown;
    };
    const wrappedMessage = Array.isArray(parsed.messages)
      ? parsed.messages.find((candidate): candidate is string =>
          typeof candidate === 'string',
        )
      : undefined;
    errorCode = typeof parsed.code === 'string' ? parsed.code : '';

    message =
      wrappedMessage ??
      (typeof parsed.message === 'string' ? parsed.message : undefined) ??
      (typeof parsed.error === 'string' ? parsed.error : undefined) ??
      fallback;
  } catch {
    // Non-JSON responses are handled below.
  }

  if (
    errorCode === 'LOGIC_FUNCTION_EXECUTION_ERROR' &&
    message.startsWith('Logic function execution failed for ')
  ) {
    return `Twenty app route failed (status ${status}). Please refresh or try again shortly.`;
  }

  if (
    containsHtmlDocument(message) ||
    isCloudflareGatewayMessage(message)
  ) {
    return `Twenty API is temporarily unavailable (status ${status}). Please refresh or try again shortly.`;
  }

  return message.replace(/^Error:\s*/, '') || fallback;
};

export const postAppRouteJson = async <TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const { apiBaseUrl, token } = getAppApiConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(extractRouteErrorMessage(rawBody, response.status));
  }

  return JSON.parse(rawBody) as TResponse;
};
