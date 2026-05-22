import { postAppRouteJson } from 'src/app-api/app-route-client';
import type {
  PublishDonationFormRequest,
  PublishDonationFormResponse,
} from 'src/logic-functions/publish-donation-form';

export const publishDonationForm = (
  input: PublishDonationFormRequest,
): Promise<PublishDonationFormResponse> =>
  postAppRouteJson<PublishDonationFormResponse>(
    '/s/donation-forms/publish',
    input,
  );
