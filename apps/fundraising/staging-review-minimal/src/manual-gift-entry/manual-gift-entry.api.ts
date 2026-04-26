import type {
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';

const getAppApiConfig = () => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  return { apiBaseUrl, token };
};

const postJson = async <TResponse>(
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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      errorBody || `Request failed with status ${response.status}`,
    );
  }

  return (await response.json()) as TResponse;
};

export const checkDonorDuplicates = (
  input: DuplicateCheckRequest,
): Promise<DuplicateCheckResponse> => {
  return postJson<DuplicateCheckResponse>(
    '/s/donor-resolution/check-donor-duplicates',
    input,
  );
};

export const createManualGift = (
  input: ManualGiftEntryRequest,
): Promise<ManualGiftEntryResponse> => {
  return postJson<ManualGiftEntryResponse>(
    '/s/manual-gift-entry/create-gift',
    input,
  );
};
