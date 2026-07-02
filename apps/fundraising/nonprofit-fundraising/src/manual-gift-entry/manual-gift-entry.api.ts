import type {
  DuplicateCheckRequest,
  DuplicateCheckResponse,
  ListAppealOptionsResponse,
  ListAppealSourceOptionsRequest,
  ListAppealSourceOptionsResponse,
  ListFundOptionsResponse,
  ManualGiftDuplicateCheckRequest,
  ManualGiftDuplicateCheckResponse,
  ManualGiftEntryRequest,
  ManualGiftEntryResponse,
  SearchCompaniesRequest,
  SearchCompaniesResponse,
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

export const searchCompanies = (
  input: SearchCompaniesRequest,
): Promise<SearchCompaniesResponse> =>
  postAppRouteJson<SearchCompaniesResponse>(
    '/s/companies/search',
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

export const listFundOptions = (): Promise<ListFundOptionsResponse> =>
  postAppRouteJson<ListFundOptionsResponse>('/s/funds/options', {});

export const listAppealOptions = (): Promise<ListAppealOptionsResponse> =>
  postAppRouteJson<ListAppealOptionsResponse>('/s/appeals/options', {});

export const listAppealSourceOptions = (
  input: ListAppealSourceOptionsRequest,
): Promise<ListAppealSourceOptionsResponse> =>
  postAppRouteJson<ListAppealSourceOptionsResponse>(
    '/s/appeal-sources/options',
    input,
  );
