import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

type SeedPerson = {
  firstName: string;
  lastName: string;
  email: string;
  mailingAddress: {
    addressStreet1: string;
    addressCity: string;
    addressPostcode: string;
    addressCountry: string;
  };
};

type SeedBatch = {
  name: string;
  source: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'PROCESSED_WITH_ISSUES';
  totalItems: number;
  processedItems: number;
  failedItems: number;
};

type SeedStagingRow = {
  name: string;
  intakeSource: string;
  amountMicros: number;
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  giftDate: string | null;
  donorResolutionState: 'UNREVIEWED' | 'AMBIGUOUS' | 'UNRESOLVED' | 'CONFIRMED';
  hasCoreGiftIssue: boolean;
  isReadyForProcessing: boolean;
  processingStatus: 'NOT_READY' | 'PROCESS_FAILED';
  errorDetail: string | null;
  batchName: string;
  linkedDonorEmail?: string;
  provider?: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerPaymentId?: string;
  providerAgreementId?: string;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
  giftAidRequested?: boolean;
  giftAidDeclarationCaptured?: boolean;
  giftAidDeclarationDate?: string;
  giftAidCoverageScope?: string;
  giftAidDeclarationSource?: string;
  giftAidTextVersion?: string;
};

type BatchSummaryRecord = {
  id: string;
  name: string;
};

type ExistingGiftStagingRecord = {
  id: string;
  name: string;
};

type SeedRecurringAgreement = {
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'COMPLETED' | 'DELINQUENT';
  cadence: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  intervalCount: number;
  amountMicros: number;
  startDate: string;
  endDate?: string;
  nextExpectedAt?: string;
  provider: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerAgreementId?: string;
  providerPaymentMethodId?: string;
  mandateReference?: string;
  donorEmail: string;
};

type ExistingRecurringAgreementRecord = {
  id: string;
  name: string;
};

type SeedGiftAidDeclaration = {
  name: string;
  donorEmail: string;
  status: 'ACTIVE' | 'INSUFFICIENT' | 'REVOKED' | 'SUPERSEDED';
  declarationDate?: string;
  coverageScope?: string;
  source?: string;
  textVersion?: string;
  statusReason?: string;
};

type ExistingGiftAidDeclarationRecord = {
  id: string;
  name: string;
};

type SeedGiftAidClaimBatch = {
  name: string;
  status: 'DRAFT' | 'SUBMITTED';
  giftCount: number;
  totalAmountMicros: number;
  hasBlockingIssues: boolean;
  blockingIssueCount: number;
  submittedAt?: string;
  notes?: string;
};

type ExistingGiftAidClaimBatchRecord = {
  id: string;
  name: string;
};

type SeedGift = {
  name: string;
  donorEmail: string;
  amountMicros: number;
  giftDate: string;
  giftAidStatus: 'CLAIMABLE' | 'NOT_CLAIMABLE' | 'NEEDS_REVIEW';
  giftAidReasonCode: string;
  giftAidDecisionSource: 'SYSTEM' | 'MANUAL_OVERRIDE';
  giftAidLastEvaluatedAt: string;
  giftAidDeclarationName?: string;
  giftAidClaimBatchName?: string;
};

type ExistingGiftRecord = {
  id: string;
  name: string;
};

const SEED_PEOPLE: SeedPerson[] = [
  {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.org',
    mailingAddress: {
      addressStreet1: '12 Analytical Engine Row',
      addressCity: 'London',
      addressPostcode: 'SW1A 1AA',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Chris',
    lastName: 'Bennett',
    email: 'chris.bennett@example.org',
    mailingAddress: {
      addressStreet1: '44 Chapel Street',
      addressCity: 'Oxford',
      addressPostcode: 'OX1 2JD',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.one@example.org',
    mailingAddress: {
      addressStreet1: '3 River View',
      addressCity: 'Bristol',
      addressPostcode: 'BS1 5TR',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.two@example.org',
    mailingAddress: {
      addressStreet1: '8 Kingsway',
      addressCity: 'Bristol',
      addressPostcode: 'BS6 2AB',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Elliot',
    lastName: 'Meyer',
    email: 'elliot.meyer@example.org',
    mailingAddress: {
      addressStreet1: '27 Market Lane',
      addressCity: 'Manchester',
      addressPostcode: 'M1 4HT',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Nora',
    lastName: 'Patel',
    email: 'nora.patel@example.org',
    mailingAddress: {
      addressStreet1: '19 Garden Close',
      addressCity: 'Leeds',
      addressPostcode: 'LS1 3AB',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Robin',
    lastName: 'Sloan',
    email: 'robin.sloan@example.org',
    mailingAddress: {
      addressStreet1: '5 Harbour Street',
      addressCity: 'Liverpool',
      addressPostcode: 'L1 8JQ',
      addressCountry: 'GB',
    },
  },
];

const SEED_BATCHES: SeedBatch[] = [
  {
    name: 'April import batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 3,
    processedItems: 0,
    failedItems: 0,
  },
  {
    name: 'Standing orders follow-up',
    source: 'integration_sync',
    status: 'PENDING',
    totalItems: 2,
    processedItems: 0,
    failedItems: 1,
  },
  {
    name: 'Stripe processing smoke batch',
    source: 'stripe_smoke',
    status: 'PENDING',
    totalItems: 4,
    processedItems: 0,
    failedItems: 0,
  },
];

const SEED_STAGING_ROWS: SeedStagingRow[] = [
  {
    name: 'April import - Ada Lovelace',
    intakeSource: 'csv_import',
    amountMicros: 25_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-04-01',
    donorResolutionState: 'UNREVIEWED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'April import batch',
    giftAidRequested: true,
    giftAidDeclarationCaptured: true,
    giftAidDeclarationDate: '2026-04-01',
    giftAidCoverageScope: 'past_and_future',
    giftAidDeclarationSource: 'csv_import',
    giftAidTextVersion: 'v1',
  },
  {
    name: 'April import - Jamie Taylor',
    intakeSource: 'csv_import',
    amountMicros: 40_000_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor@unknown.example.org',
    giftDate: '2026-04-02',
    donorResolutionState: 'AMBIGUOUS',
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'April import batch',
  },
  {
    name: 'April import - Chris Bennett unresolved',
    intakeSource: 'csv_import',
    amountMicros: 30_000_000,
    donorFirstName: 'Chris',
    donorLastName: 'Bennett',
    donorEmail: 'chris.bennett@example.org',
    giftDate: '2026-04-03',
    donorResolutionState: 'UNRESOLVED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'April import batch',
  },
  {
    name: 'Standing order follow-up - Elliot Meyer',
    intakeSource: 'integration_sync',
    amountMicros: 15_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: null,
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: true,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'Standing orders follow-up',
    linkedDonorEmail: 'elliot.meyer@example.org',
  },
  {
    name: 'Standing order follow-up - Chris Bennett failed',
    intakeSource: 'integration_sync',
    amountMicros: 12_500_000,
    donorFirstName: 'Chris',
    donorLastName: 'Bennett',
    donorEmail: 'chris.bennett@example.org',
    giftDate: '2026-04-05',
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: false,
    processingStatus: 'PROCESS_FAILED',
    errorDetail: 'Duplicate external payment id needs follow-up before retry.',
    batchName: 'Standing orders follow-up',
    linkedDonorEmail: 'chris.bennett@example.org',
  },
  {
    name: 'Stripe smoke - Ada ready one-off',
    intakeSource: 'stripe_webhook',
    amountMicros: 25_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-04-20',
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: true,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'Stripe processing smoke batch',
    linkedDonorEmail: 'ada.lovelace@example.org',
    provider: 'STRIPE',
    providerPaymentId: 'pi_smoke_ada_one_off',
    giftAidRequested: true,
  },
  {
    name: 'Stripe smoke - Nora ready recurring review',
    intakeSource: 'stripe_webhook',
    amountMicros: 18_000_000,
    donorFirstName: 'Nora',
    donorLastName: 'Patel',
    donorEmail: 'nora.patel@example.org',
    giftDate: '2026-04-21',
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: true,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'Stripe processing smoke batch',
    linkedDonorEmail: 'nora.patel@example.org',
    provider: 'STRIPE',
    providerPaymentId: 'pi_smoke_nora_recurring',
    providerAgreementId: 'sub_smoke_nora_monthly',
    providerIntervalUnit: 'month',
    providerIntervalCount: 1,
    giftAidRequested: false,
  },
  {
    name: 'Stripe smoke - Robin recurring unsupported cadence',
    intakeSource: 'stripe_webhook',
    amountMicros: 22_000_000,
    donorFirstName: 'Robin',
    donorLastName: 'Sloan',
    donorEmail: 'robin.sloan@example.org',
    giftDate: '2026-04-22',
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: false,
    isReadyForProcessing: true,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'Stripe processing smoke batch',
    linkedDonorEmail: 'robin.sloan@example.org',
    provider: 'STRIPE',
    providerPaymentId: 'pi_smoke_robin_recurring',
    providerAgreementId: 'sub_smoke_robin_unsupported',
    providerIntervalUnit: 'day',
    providerIntervalCount: 14,
    giftAidRequested: false,
  },
  {
    name: 'Stripe smoke - Elliot blocked core issue',
    intakeSource: 'stripe_webhook',
    amountMicros: 12_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: null,
    donorResolutionState: 'CONFIRMED',
    hasCoreGiftIssue: true,
    isReadyForProcessing: false,
    processingStatus: 'NOT_READY',
    errorDetail: null,
    batchName: 'Stripe processing smoke batch',
    linkedDonorEmail: 'elliot.meyer@example.org',
    provider: 'STRIPE',
    providerPaymentId: 'pi_smoke_elliot_blocked',
  },
];

const SEED_RECURRING_AGREEMENTS: SeedRecurringAgreement[] = [
  {
    name: 'Ada Lovelace monthly giving',
    status: 'ACTIVE',
    cadence: 'MONTHLY',
    intervalCount: 1,
    amountMicros: 25_000_000,
    startDate: '2026-01-01',
    nextExpectedAt: '2026-05-01',
    provider: 'STRIPE',
    providerAgreementId: 'sub_ada_monthly',
    providerPaymentMethodId: 'pm_ada_visa',
    donorEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Chris Bennett standing order',
    status: 'DELINQUENT',
    cadence: 'MONTHLY',
    intervalCount: 1,
    amountMicros: 12_500_000,
    startDate: '2025-11-01',
    nextExpectedAt: '2026-04-05',
    provider: 'MANUAL',
    mandateReference: 'SO-CHRIS-001',
    donorEmail: 'chris.bennett@example.org',
  },
];

const SEED_GIFT_AID_DECLARATIONS: SeedGiftAidDeclaration[] = [
  {
    name: 'Ada Lovelace declaration 2026-01-15',
    donorEmail: 'ada.lovelace@example.org',
    status: 'ACTIVE',
    declarationDate: '2026-01-15',
    coverageScope: 'past_and_future',
    source: 'seed_data',
    textVersion: 'v1',
  },
  {
    name: 'Elliot Meyer insufficient declaration',
    donorEmail: 'elliot.meyer@example.org',
    status: 'INSUFFICIENT',
    declarationDate: '2026-02-10',
    coverageScope: 'future_only',
    source: 'seed_data',
    textVersion: 'v1',
    statusReason: 'donor_data_incomplete',
  },
];

const SEED_GIFT_AID_CLAIM_BATCHES: SeedGiftAidClaimBatch[] = [
  {
    name: 'Gift Aid walkthrough draft claim',
    status: 'DRAFT',
    giftCount: 1,
    totalAmountMicros: 25_000_000,
    hasBlockingIssues: true,
    blockingIssueCount: 1,
    notes:
      'Seeded exploratory draft claim for Gift Aid workspace and gift-record review.',
  },
  {
    name: 'Gift Aid walkthrough clean draft claim',
    status: 'DRAFT',
    giftCount: 1,
    totalAmountMicros: 31_000_000,
    hasBlockingIssues: false,
    blockingIssueCount: 0,
    notes:
      'Seeded clean Gift Aid draft claim for HMRC submission probe validation.',
  },
];

const SEED_GIFTS: SeedGift[] = [
  {
    name: 'Gift Aid walkthrough - Ada claimable',
    donorEmail: 'ada.lovelace@example.org',
    amountMicros: 25_000_000,
    giftDate: '2026-04-10',
    giftAidStatus: 'CLAIMABLE',
    giftAidReasonCode: 'valid_declaration_present',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-10T10:00:00.000Z',
    giftAidDeclarationName: 'Ada Lovelace declaration 2026-01-15',
    giftAidClaimBatchName: 'Gift Aid walkthrough draft claim',
  },
  {
    name: 'Gift Aid walkthrough - Elliot needs review in claim',
    donorEmail: 'elliot.meyer@example.org',
    amountMicros: 18_000_000,
    giftDate: '2026-04-11',
    giftAidStatus: 'NEEDS_REVIEW',
    giftAidReasonCode: 'donor_data_incomplete',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-11T11:15:00.000Z',
    giftAidDeclarationName: 'Elliot Meyer insufficient declaration',
    giftAidClaimBatchName: 'Gift Aid walkthrough draft claim',
  },
  {
    name: 'Gift Aid walkthrough - Chris needs review outside claim',
    donorEmail: 'chris.bennett@example.org',
    amountMicros: 12_500_000,
    giftDate: '2026-04-12',
    giftAidStatus: 'NEEDS_REVIEW',
    giftAidReasonCode: 'no_declaration_on_file',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-12T09:30:00.000Z',
  },
  {
    name: 'Gift Aid walkthrough - Nora not claimable',
    donorEmail: 'nora.patel@example.org',
    amountMicros: 9_000_000,
    giftDate: '2026-04-13',
    giftAidStatus: 'NOT_CLAIMABLE',
    giftAidReasonCode: 'not_requested',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-13T08:45:00.000Z',
  },
  {
    name: 'Gift Aid walkthrough - Ada claimable clean batch',
    donorEmail: 'ada.lovelace@example.org',
    amountMicros: 31_000_000,
    giftDate: '2026-04-14',
    giftAidStatus: 'CLAIMABLE',
    giftAidReasonCode: 'valid_declaration_present',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-14T10:00:00.000Z',
    giftAidDeclarationName: 'Ada Lovelace declaration 2026-01-15',
    giftAidClaimBatchName: 'Gift Aid walkthrough clean draft claim',
  },
];

const normalizeEmail = (value: string | undefined | null) =>
  value?.trim().toLowerCase() ?? '';

const isUniqueViolationError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('uniqueness') ||
    lower.includes('already exists') ||
    lower.includes('violates unique')
  );
};

const loadPeople = async (client: CoreApiClient): Promise<PersonSummary[]> => {
  const result = await client.query({
    people: {
      __args: {
        first: 5000,
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.people?.edges?.map(
      (edge: { node: PersonSummary }) => edge.node,
    ) ?? []
  );
};

const loadGiftBatches = async (
  client: CoreApiClient,
): Promise<BatchSummaryRecord[]> => {
  const result = await client.query({
    giftBatches: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftBatches?.edges?.map(
      (edge: { node: BatchSummaryRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftStagings = async (
  client: CoreApiClient,
): Promise<ExistingGiftStagingRecord[]> => {
  const result = await client.query({
    giftStagings: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftStagings?.edges?.map(
      (edge: { node: ExistingGiftStagingRecord }) => edge.node,
    ) ?? []
  );
};

const loadRecurringAgreements = async (
  client: CoreApiClient,
): Promise<ExistingRecurringAgreementRecord[]> => {
  const result = await client.query({
    recurringAgreements: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.recurringAgreements?.edges?.map(
      (edge: { node: ExistingRecurringAgreementRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftAidDeclarations = async (
  client: CoreApiClient,
): Promise<ExistingGiftAidDeclarationRecord[]> => {
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: ExistingGiftAidDeclarationRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftAidClaimBatches = async (
  client: CoreApiClient,
): Promise<ExistingGiftAidClaimBatchRecord[]> => {
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidClaimBatches?.edges?.map(
      (edge: { node: ExistingGiftAidClaimBatchRecord }) => edge.node,
    ) ?? []
  );
};

const loadGifts = async (client: CoreApiClient): Promise<ExistingGiftRecord[]> => {
  const result = await client.query({
    gifts: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.gifts?.edges?.map((edge: { node: ExistingGiftRecord }) => edge.node) ??
    []
  );
};

const loadPersonByEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<PersonSummary | undefined> => {
  const result = await client.query({
    people: {
      __args: {
        first: 1,
        filter: {
          emails: {
            primaryEmail: {
              eq: email,
            },
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
      },
    },
  } as any);

  return result?.people?.edges?.[0]?.node as PersonSummary | undefined;
};

const findExistingPerson = (
  people: PersonSummary[],
  seed: SeedPerson,
): PersonSummary | undefined => {
  return people.find(
    (person) =>
      person.name?.firstName === seed.firstName &&
      person.name?.lastName === seed.lastName &&
      normalizeEmail(person.emails?.primaryEmail) === normalizeEmail(seed.email),
  );
};

const seedPeople = async (client: CoreApiClient) => {
  const existingPeople = await loadPeople(client);
  const peopleByEmail = new Map<string, PersonSummary>();

  for (const seed of SEED_PEOPLE) {
    const existing =
      findExistingPerson(existingPeople, seed) ??
      (await loadPersonByEmail(client, seed.email));

    if (existing) {
      await client.mutation({
        updatePerson: {
          __args: {
            id: existing.id,
            data: {
              mailingAddress: seed.mailingAddress,
            },
          },
          id: true,
        },
      } as any);
      peopleByEmail.set(seed.email, existing);
      continue;
    }

    try {
      const result = await client.mutation({
        createPerson: {
          __args: {
            data: {
              name: {
                firstName: seed.firstName,
                lastName: seed.lastName,
              },
              emails: {
                primaryEmail: seed.email,
              },
              mailingAddress: seed.mailingAddress,
            },
          },
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
      } as any);

      const created = result?.createPerson as PersonSummary | undefined;

      if (created?.id) {
        peopleByEmail.set(seed.email, created);
      }
    } catch (error) {
      if (isUniqueViolationError(error)) {
        const duplicate =
          (await loadPersonByEmail(client, seed.email)) ??
          findExistingPerson(await loadPeople(client), seed);

        if (duplicate?.id) {
          peopleByEmail.set(seed.email, duplicate);
          continue;
        }
      }

      throw error;
    }
  }

  return peopleByEmail;
};

const seedBatches = async (client: CoreApiClient) => {
  const existingBatches = await loadGiftBatches(client);
  const batchesByName = new Map<string, BatchSummaryRecord>();

  for (const seed of SEED_BATCHES) {
    const existing = existingBatches.find((batch) => batch.name === seed.name);

    if (existing) {
      batchesByName.set(seed.name, existing);
      continue;
    }

    const result = await client.mutation({
      createGiftBatch: {
        __args: {
          data: seed,
        },
        id: true,
        name: true,
      },
    } as any);

    const created = result?.createGiftBatch as BatchSummaryRecord | undefined;

    if (created?.id) {
      batchesByName.set(seed.name, created);
    }
  }

  return batchesByName;
};

const seedGiftStagings = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
  batchesByName: Map<string, BatchSummaryRecord>,
) => {
  const existingRows = await loadGiftStagings(client);
  const existingRowNames = new Set(existingRows.map((row) => row.name));

  for (const seed of SEED_STAGING_ROWS) {
    if (existingRowNames.has(seed.name)) {
      continue;
    }

    const batch = batchesByName.get(seed.batchName);

    if (!batch) {
      throw new Error(`Seed batch "${seed.batchName}" not found`);
    }

    const linkedDonor = seed.linkedDonorEmail
      ? peopleByEmail.get(seed.linkedDonorEmail)
      : undefined;

    await client.mutation({
      createGiftStaging: {
        __args: {
          data: {
            name: seed.name,
            intakeSource: seed.intakeSource,
            amount: {
              currencyCode: 'GBP',
              amountMicros: seed.amountMicros,
            },
            giftDate: seed.giftDate,
            donorFirstName: seed.donorFirstName,
            donorLastName: seed.donorLastName,
            ...(seed.donorEmail
              ? {
                  donorEmail: seed.donorEmail,
                }
              : {}),
            ...(seed.provider ? { provider: seed.provider } : {}),
            ...(seed.providerPaymentId
              ? { providerPaymentId: seed.providerPaymentId }
              : {}),
            ...(seed.providerAgreementId
              ? { providerAgreementId: seed.providerAgreementId }
              : {}),
            ...(seed.providerIntervalUnit
              ? { providerIntervalUnit: seed.providerIntervalUnit }
              : {}),
            ...(typeof seed.providerIntervalCount === 'number'
              ? { providerIntervalCount: seed.providerIntervalCount }
              : {}),
            donorResolutionState: seed.donorResolutionState,
            hasCoreGiftIssue: seed.hasCoreGiftIssue,
            isReadyForProcessing: seed.isReadyForProcessing,
            processingStatus: seed.processingStatus,
            errorDetail: seed.errorDetail,
            giftAidRequested: seed.giftAidRequested ?? false,
            giftAidDeclarationCaptured:
              seed.giftAidDeclarationCaptured ?? false,
            ...(seed.giftAidDeclarationDate
              ? { giftAidDeclarationDate: seed.giftAidDeclarationDate }
              : {}),
            ...(seed.giftAidCoverageScope
              ? { giftAidCoverageScope: seed.giftAidCoverageScope }
              : {}),
            ...(seed.giftAidDeclarationSource
              ? { giftAidDeclarationSource: seed.giftAidDeclarationSource }
              : {}),
            ...(seed.giftAidTextVersion
              ? { giftAidTextVersion: seed.giftAidTextVersion }
              : {}),
            giftBatch: {
              connect: {
                where: {
                  id: batch.id,
                },
              },
            },
            ...(linkedDonor
              ? {
                  donor: {
                    connect: {
                      where: {
                        id: linkedDonor.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedGiftAidDeclarations = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
) => {
  const existingDeclarations = await loadGiftAidDeclarations(client);

  for (const seed of SEED_GIFT_AID_DECLARATIONS) {
    const existing = existingDeclarations.find(
      (declaration) => declaration.name === seed.name,
    );

    if (existing) {
      continue;
    }

    const person = peopleByEmail.get(seed.donorEmail);

    if (!person?.id) {
      throw new Error(`Seed donor "${seed.donorEmail}" not found`);
    }

    await client.mutation({
      createGiftAidDeclaration: {
        __args: {
          data: {
            name: seed.name,
            personId: person.id,
            status: seed.status,
            ...(seed.declarationDate
              ? { declarationDate: seed.declarationDate }
              : {}),
            ...(seed.coverageScope ? { coverageScope: seed.coverageScope } : {}),
            ...(seed.source ? { source: seed.source } : {}),
            ...(seed.textVersion ? { textVersion: seed.textVersion } : {}),
            ...(seed.statusReason ? { statusReason: seed.statusReason } : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedGiftAidClaimBatches = async (client: CoreApiClient) => {
  const existingBatches = await loadGiftAidClaimBatches(client);
  const batchesByName = new Map<string, ExistingGiftAidClaimBatchRecord>();

  for (const seed of SEED_GIFT_AID_CLAIM_BATCHES) {
    const existing = existingBatches.find((batch) => batch.name === seed.name);

    if (existing) {
      batchesByName.set(seed.name, existing);
      continue;
    }

    const result = await client.mutation({
      createGiftAidClaimBatch: {
        __args: {
          data: {
            name: seed.name,
            status: seed.status,
            giftCount: seed.giftCount,
            totalAmount: {
              currencyCode: 'GBP',
              amountMicros: seed.totalAmountMicros,
            },
            hasBlockingIssues: seed.hasBlockingIssues,
            blockingIssueCount: seed.blockingIssueCount,
            ...(seed.submittedAt ? { submittedAt: seed.submittedAt } : {}),
            ...(seed.notes ? { notes: seed.notes } : {}),
          },
        },
        id: true,
        name: true,
      },
    } as any);

    const created = result?.createGiftAidClaimBatch as
      | ExistingGiftAidClaimBatchRecord
      | undefined;

    if (created?.id) {
      batchesByName.set(seed.name, created);
    }
  }

  return batchesByName;
};

const seedGifts = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
  declarationsByName: Map<string, ExistingGiftAidDeclarationRecord>,
  claimBatchesByName: Map<string, ExistingGiftAidClaimBatchRecord>,
) => {
  const existingGifts = await loadGifts(client);
  const existingGiftNames = new Set(existingGifts.map((gift) => gift.name));

  for (const seed of SEED_GIFTS) {
    if (existingGiftNames.has(seed.name)) {
      continue;
    }

    const donor = peopleByEmail.get(seed.donorEmail);
    if (!donor?.id) {
      throw new Error(`Seed donor "${seed.donorEmail}" not found for gift "${seed.name}"`);
    }

    const declaration = seed.giftAidDeclarationName
      ? declarationsByName.get(seed.giftAidDeclarationName)
      : undefined;
    const claimBatch = seed.giftAidClaimBatchName
      ? claimBatchesByName.get(seed.giftAidClaimBatchName)
      : undefined;

    await client.mutation({
      createGift: {
        __args: {
          data: {
            name: seed.name,
            amount: {
              currencyCode: 'GBP',
              amountMicros: seed.amountMicros,
            },
            giftDate: seed.giftDate,
            donorFirstName: donor.name?.firstName ?? '',
            donorLastName: donor.name?.lastName ?? '',
            ...(donor.emails?.primaryEmail
              ? { donorEmail: donor.emails.primaryEmail }
              : {}),
            donor: {
              connect: {
                where: {
                  id: donor.id,
                },
              },
            },
            giftAidStatus: seed.giftAidStatus,
            giftAidReasonCode: seed.giftAidReasonCode,
            giftAidDecisionSource: seed.giftAidDecisionSource,
            giftAidLastEvaluatedAt: seed.giftAidLastEvaluatedAt,
            ...(declaration?.id
              ? {
                  giftAidDeclaration: {
                    connect: {
                      where: {
                        id: declaration.id,
                      },
                    },
                  },
                }
              : {}),
            ...(claimBatch?.id
              ? {
                  giftAidClaimBatch: {
                    connect: {
                      where: {
                        id: claimBatch.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedRecurringAgreements = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
) => {
  const existingAgreements = await loadRecurringAgreements(client);

  for (const seed of SEED_RECURRING_AGREEMENTS) {
    const existing = existingAgreements.find(
      (agreement) => agreement.name === seed.name,
    );

    if (existing) {
      continue;
    }

    const person = peopleByEmail.get(seed.donorEmail);

    await client.mutation({
      createRecurringAgreement: {
        __args: {
          data: {
            name: seed.name,
            status: seed.status,
            cadence: seed.cadence,
            intervalCount: seed.intervalCount,
            amount: {
              currencyCode: 'GBP',
              amountMicros: seed.amountMicros,
            },
            startDate: seed.startDate,
            ...(seed.endDate ? { endDate: seed.endDate } : {}),
            ...(seed.nextExpectedAt
              ? { nextExpectedAt: seed.nextExpectedAt }
              : {}),
            provider: seed.provider,
            ...(seed.providerAgreementId
              ? { providerAgreementId: seed.providerAgreementId }
              : {}),
            ...(seed.providerPaymentMethodId
              ? { providerPaymentMethodId: seed.providerPaymentMethodId }
              : {}),
            ...(seed.mandateReference
              ? { mandateReference: seed.mandateReference }
              : {}),
            ...(person?.id
              ? {
                  person: {
                    connect: {
                      where: {
                        id: person.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  // This seed set is intentionally idempotent because it is a development
  // harness we expect to rerun as slices are added and refined.
  const peopleByEmail = await seedPeople(client);
  const batchesByName = await seedBatches(client);
  await seedGiftAidDeclarations(client, peopleByEmail);
  const declarationRecords = await loadGiftAidDeclarations(client);
  const declarationsByName = new Map(
    declarationRecords.map((declaration) => [declaration.name, declaration] as const),
  );
  const claimBatchesByName = await seedGiftAidClaimBatches(client);
  await seedRecurringAgreements(client, peopleByEmail);
  await seedGifts(
    client,
    peopleByEmail,
    declarationsByName,
    claimBatchesByName,
  );

  await seedGiftStagings(client, peopleByEmail, batchesByName);
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'd73bfd2a-68db-44ab-a1c5-2b6bfa07735a',
  name: 'post-install',
  description:
    'Seeds local development data for manual entry and staging-review slices.',
  timeoutSeconds: 120,
  handler,
});
