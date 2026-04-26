import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { searchRecurringAgreements } from 'src/recurring/recurring.service';
import type {
  SearchRecurringAgreementsRequest,
  SearchRecurringAgreementsResponse,
} from 'src/recurring/recurring.types';

const handler = async (
  event: RoutePayload<SearchRecurringAgreementsRequest>,
): Promise<SearchRecurringAgreementsResponse> => {
  const client = new CoreApiClient();
  const agreements = await searchRecurringAgreements(
    client,
    event.body?.query ?? '',
  );

  return {
    agreements,
  };
};

export default defineLogicFunction({
  universalIdentifier: '28dd6049-dc92-479e-a940-f2052ba760fa',
  name: 'search-recurring-agreements',
  description:
    'Searches existing recurring agreements for manual gift-entry linkage.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/recurring-agreements/search',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
