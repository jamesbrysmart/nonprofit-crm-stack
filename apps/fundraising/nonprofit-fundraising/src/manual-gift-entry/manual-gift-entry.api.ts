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
import { postAppRouteJson } from 'src/app-api/app-route-client';

export const checkDonorDuplicates = (
  input: DuplicateCheckRequest,
): Promise<DuplicateCheckResponse> =>
  postAppRouteJson<DuplicateCheckResponse>(
    '/s/donor-resolution/check-donor-duplicates',
    input,
  );

export const checkCompanyDuplicates = (
  input: CompanyDuplicateCheckRequest,
): Promise<CompanyDuplicateCheckResponse> =>
  postAppRouteJson<CompanyDuplicateCheckResponse>(
    '/s/company-resolution/check-company-duplicates',
    input,
  );

export const createManualGift = (
  input: ManualGiftEntryRequest,
): Promise<ManualGiftEntryResponse> =>
  postAppRouteJson<ManualGiftEntryResponse>(
    '/s/manual-gift-entry/create-gift',
    input,
  );

export const checkManualGiftDuplicates = (
  input: ManualGiftDuplicateCheckRequest,
): Promise<ManualGiftDuplicateCheckResponse> =>
  postAppRouteJson<ManualGiftDuplicateCheckResponse>(
    '/s/manual-gift-entry/check-duplicates',
    input,
  );

export const searchRecurringAgreements = (
  input: SearchRecurringAgreementsRequest,
): Promise<SearchRecurringAgreementsResponse> =>
  postAppRouteJson<SearchRecurringAgreementsResponse>(
    '/s/recurring-agreements/search',
    input,
  );

export const searchOpportunities = (
  input: SearchOpportunitiesRequest,
): Promise<SearchOpportunitiesResponse> =>
  postAppRouteJson<SearchOpportunitiesResponse>(
    '/s/opportunities/search',
    input,
  );
