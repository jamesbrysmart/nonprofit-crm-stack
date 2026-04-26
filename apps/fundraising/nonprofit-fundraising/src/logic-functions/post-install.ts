import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import type { PersonSummary } from 'src/manual-gift-entry/manual-gift-entry.types';

type SeedPerson = {
  firstName: string;
  lastName: string;
  email: string;
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
  processingStatus: 'NOT_READY' | 'READY' | 'PROCESS_FAILED';
  errorDetail: string | null;
  batchName: string;
  linkedDonorEmail?: string;
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

const SEED_PEOPLE: SeedPerson[] = [
  {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.org',
  },
  {
    firstName: 'Chris',
    lastName: 'Bennett',
    email: 'chris.bennett@example.org',
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.one@example.org',
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.two@example.org',
  },
  {
    firstName: 'Elliot',
    lastName: 'Meyer',
    email: 'elliot.meyer@example.org',
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

const loadPeople = async (client: CoreApiClient): Promise<PersonSummary[]> => {
  const result = await client.query({
    people: {
      __args: {
        first: 100,
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

const findExistingPerson = (
  people: PersonSummary[],
  seed: SeedPerson,
): PersonSummary | undefined => {
  return people.find(
    (person) =>
      person.name?.firstName === seed.firstName &&
      person.name?.lastName === seed.lastName &&
      person.emails?.primaryEmail === seed.email,
  );
};

const seedPeople = async (client: CoreApiClient) => {
  const existingPeople = await loadPeople(client);
  const peopleByEmail = new Map<string, PersonSummary>();

  for (const seed of SEED_PEOPLE) {
    const existing = findExistingPerson(existingPeople, seed);

    if (existing) {
      peopleByEmail.set(seed.email, existing);
      continue;
    }

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
  await seedRecurringAgreements(client, peopleByEmail);

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
