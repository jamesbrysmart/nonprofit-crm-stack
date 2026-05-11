import type {
  CompanyDuplicateCheckRequest,
  CompanyDuplicateCheckResponse,
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  ManualGiftDuplicateCheckRequest,
  ManualGiftDuplicateCheckResponse,
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
  SearchOpportunitiesRequest,
  SearchOpportunitiesResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type {
  SearchRecurringAgreementsRequest,
  SearchRecurringAgreementsResponse,
} from 'src/recurring/recurring.types';

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

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Request failed with status ${response.status}`);
  }

  return JSON.parse(rawBody) as TResponse;
};

export const checkDonorDuplicates = (
  input: DuplicateCheckRequest,
): Promise<DuplicateCheckResponse> =>
  postJson<DuplicateCheckResponse>(
    '/s/donor-resolution/check-donor-duplicates',
    input,
  );

export const checkCompanyDuplicates = (
  input: CompanyDuplicateCheckRequest,
): Promise<CompanyDuplicateCheckResponse> =>
  postJson<CompanyDuplicateCheckResponse>(
    '/s/company-resolution/check-company-duplicates',
    input,
  );

export const createManualGift = (
  input: ManualGiftEntryRequest,
): Promise<ManualGiftEntryResponse> =>
  postJson<ManualGiftEntryResponse>('/s/manual-gift-entry/create-gift', input);

export const checkManualGiftDuplicates = (
  input: ManualGiftDuplicateCheckRequest,
): Promise<ManualGiftDuplicateCheckResponse> =>
  postJson<ManualGiftDuplicateCheckResponse>(
    '/s/manual-gift-entry/check-duplicates',
    input,
  );

export const searchRecurringAgreements = (
  input: SearchRecurringAgreementsRequest,
): Promise<SearchRecurringAgreementsResponse> =>
  postJson<SearchRecurringAgreementsResponse>(
    '/s/recurring-agreements/search',
    input,
  );

export const searchOpportunities = (
  input: SearchOpportunitiesRequest,
): Promise<SearchOpportunitiesResponse> =>
  postJson<SearchOpportunitiesResponse>('/s/opportunities/search', input);
