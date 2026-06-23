export type RecurringAgreementStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELED'
  | 'COMPLETED'
  | 'DELINQUENT';

export type RecurringAgreementCadence =
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'CUSTOM';

export type RecurringAgreementSummary = {
  id: string;
  name: string;
  status: string | null;
  cadence: string | null;
  intervalCount: number | null;
  nextExpectedAt: string | null;
  provider: string | null;
  amount:
    | {
        amountMicros?: number | null;
        currencyCode?: string | null;
      }
    | null;
  person: {
    id: string;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    emails?: {
      primaryEmail?: string | null;
    } | null;
  } | null;
};

export type SearchRecurringAgreementsRequest = {
  query?: string;
};

export type SearchRecurringAgreementsResponse = {
  agreements: RecurringAgreementSummary[];
};

export type StoredRecurringAgreementRecord = RecurringAgreementSummary & {
  startDate: string | null;
  endDate: string | null;
  paymentType: string | null;
  providerAgreementId: string | null;
  providerPaymentMethodId: string | null;
  mandateReference: string | null;
  appeal: {
    id?: string | null;
    name?: string | null;
  } | null;
  appealSource: {
    id?: string | null;
    name?: string | null;
  } | null;
  fund: {
    id?: string | null;
    name?: string | null;
    code?: string | null;
  } | null;
  gifts: Array<{
    id: string;
    name: string | null;
    giftDate: string | null;
    amount:
      | {
          amountMicros?: number | null;
          currencyCode?: string | null;
        }
      | null;
    donorFirstName: string | null;
    donorLastName: string | null;
  }>;
  giftStagings: Array<{
    id: string;
    name: string | null;
    giftDate: string | null;
    processingStatus: string | null;
    donorFirstName: string | null;
    donorLastName: string | null;
  }>;
};

export type RecurringAgreementHealthState =
  | 'ON_TRACK'
  | 'OVERDUE'
  | 'PAUSED'
  | 'CANCELED'
  | 'COMPLETED'
  | 'DELINQUENT'
  | 'NO_EXPECTATION';

export type RecurringAgreementHealth = {
  state: RecurringAgreementHealthState;
  label: string;
  message: string;
  daysDelta: number | null;
};

export type RecurringAgreementReviewRecord = {
  id: string;
  name: string;
  status: string;
  cadence: string;
  intervalCount: number;
  amountLabel: string;
  amountMicros: number | null;
  currencyCode: string;
  startDate: string | null;
  endDate: string | null;
  nextExpectedAt: string | null;
  paymentType: string | null;
  provider: string;
  providerAgreementId: string | null;
  providerPaymentMethodId: string | null;
  mandateReference: string | null;
  appealName: string | null;
  appealId: string | null;
  appealSourceName: string | null;
  appealSourceId: string | null;
  fundName: string | null;
  fundId: string | null;
  donorName: string;
  donorId: string | null;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string | null;
  health: RecurringAgreementHealth;
  recentGifts: StoredRecurringAgreementRecord['gifts'];
  recentGiftStagings: StoredRecurringAgreementRecord['giftStagings'];
};
