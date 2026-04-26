import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk';
import type { BatchSummaryRecord } from 'src/batch-processing/batch-processing.types';
import type { PersonSummary } from 'src/staging-review/staging-review.types';

type SeedPerson = {
  firstName: string;
  lastName: string;
  email: string;
};

type SeedBatch = {
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'PROCESSED_WITH_ISSUES';
  totalItems: number;
  processedItems: number;
  failedItems: number;
};

type SeedStagingRow = {
  name: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorId?: string | null;
  amount: string;
  giftDate: string;
  donorResolutionState: 'UNREVIEWED' | 'AMBIGUOUS' | 'CONFIRMED' | 'UNRESOLVED';
  processingOutcome: 'NOT_RUN' | 'FAILED';
  hasCoreGiftIssue: boolean;
  isReadyForProcessing: boolean;
  processingStatus: 'NOT_READY' | 'PENDING' | 'PROCESSED' | 'PROCESS_FAILED';
  errorDetail: string | null;
  giftAidRequested?: boolean;
  giftAidDeclarationCaptured?: boolean;
  giftAidDeclarationDate?: string | null;
  giftAidCoverageScope?: string | null;
  giftAidDeclarationSource?: string | null;
  giftAidTextVersion?: string | null;
  batchName: string;
};

const buildSeedRow = (row: SeedStagingRow): SeedStagingRow => row;

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
    status: 'PENDING',
    totalItems: 3,
    processedItems: 0,
    failedItems: 0,
  },
  {
    name: 'Standing orders follow-up',
    status: 'PENDING',
    totalItems: 2,
    processedItems: 0,
    failedItems: 1,
  },
  {
    name: 'Executor clean path stress',
    status: 'PENDING',
    totalItems: 35,
    processedItems: 0,
    failedItems: 0,
  },
  {
    name: 'Executor mixed readiness stress',
    status: 'PENDING',
    totalItems: 8,
    processedItems: 0,
    failedItems: 0,
  },
  {
    name: 'Executor split fallback stress',
    status: 'PENDING',
    totalItems: 9,
    processedItems: 0,
    failedItems: 0,
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

const loadPeopleByPrimaryEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<PersonSummary[]> => {
  const result = await client.query({
    people: {
      __args: {
        first: 20,
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
          status: true,
          totalItems: true,
          processedItems: true,
          failedItems: true,
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

const loadExistingStagingRowNames = async (
  client: CoreApiClient,
): Promise<Set<string>> => {
  const result = await client.query({
    stagingReviewItems: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          name: true,
        },
      },
    },
  } as any);

  return new Set(
    result?.stagingReviewItems?.edges?.map(
      (edge: { node: { name: string } }) => edge.node.name,
    ) ?? [],
  );
};

type ExistingStagingRow = {
  id: string;
  name: string;
  giftBatch?: {
    id: string;
  } | null;
};

const loadExistingStagingRows = async (
  client: CoreApiClient,
): Promise<ExistingStagingRow[]> => {
  const result = await client.query({
    stagingReviewItems: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
          giftBatch: {
            id: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.stagingReviewItems?.edges?.map(
      (edge: { node: ExistingStagingRow }) => edge.node,
    ) ?? []
  );
};

const findExistingPerson = (
  people: PersonSummary[],
  seed: SeedPerson,
): PersonSummary | undefined => {
  return people.find((person) => {
    return (
      person.name?.firstName === seed.firstName &&
      person.name?.lastName === seed.lastName &&
      person.emails?.primaryEmail === seed.email
    );
  });
};

const ensureSeedPeople = async (client: CoreApiClient) => {
  let existingPeople = await loadPeople(client);
  const peopleByEmail = new Map<string, PersonSummary>();

  for (const seed of SEED_PEOPLE) {
    const existing = findExistingPerson(existingPeople, seed);

    if (existing) {
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

      const created = result.createPerson as PersonSummary;
      peopleByEmail.set(seed.email, created);
      existingPeople = [...existingPeople, created];
    } catch (error) {
      const refreshedPeople = await loadPeopleByPrimaryEmail(client, seed.email);
      existingPeople = refreshedPeople;
      const recovered = findExistingPerson(refreshedPeople, seed);

      if (!recovered) {
        throw error;
      }

      peopleByEmail.set(seed.email, recovered);
    }
  }

  return peopleByEmail;
};

const ensureGiftBatches = async (client: CoreApiClient) => {
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
        status: true,
        totalItems: true,
        processedItems: true,
        failedItems: true,
      },
    } as any);

    batchesByName.set(seed.name, result.createGiftBatch as BatchSummaryRecord);
  }

  return batchesByName;
};

const buildCleanStressRows = (
  donors: Array<{
    firstName: string;
    lastName: string;
    email: string;
    donorId: string | null;
  }>,
): SeedStagingRow[] => {
  return Array.from({ length: 35 }, (_, index) => {
    const donor = donors[index % donors.length];
    const amount = (25 + index * 3).toFixed(2);
    const day = String((index % 9) + 1).padStart(2, '0');

    return buildSeedRow({
      name: `Executor clean row ${String(index + 1).padStart(3, '0')}`,
      donorFirstName: donor.firstName,
      donorLastName: donor.lastName,
      donorEmail: donor.email,
      donorId: donor.donorId,
      amount: `£${amount}`,
      giftDate: `2026-04-${day}T10:00:00.000Z`,
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      giftAidRequested: index === 0,
      giftAidDeclarationCaptured: index === 0,
      giftAidDeclarationDate: index === 0 ? '2026-04-01' : null,
      giftAidCoverageScope: index === 0 ? 'past_and_future' : null,
      giftAidDeclarationSource: index === 0 ? 'import' : null,
      giftAidTextVersion: index === 0 ? 'v1' : null,
      batchName: 'Executor clean path stress',
    });
  });
};

const buildMixedReadinessStressRows = (
  donors: {
    adaId: string | null;
    chrisId: string | null;
    elliotId: string | null;
  },
): SeedStagingRow[] => {
  return [
    buildSeedRow({
      name: 'Mixed readiness row 001',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      donorId: donors.adaId,
      amount: '£31.00',
      giftDate: '2026-04-11T10:00:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: '2026-04-11',
      giftAidCoverageScope: 'past_and_future',
      giftAidDeclarationSource: 'batch_review_seed',
      giftAidTextVersion: 'v1',
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 002',
      donorFirstName: 'Chris',
      donorLastName: 'Bennett',
      donorEmail: 'chris.bennett@example.org',
      donorId: donors.chrisId,
      amount: '£42.00',
      giftDate: '2026-04-11T10:05:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 003',
      donorFirstName: 'Elliot',
      donorLastName: 'Meyer',
      donorEmail: 'elliot.meyer@example.org',
      donorId: donors.elliotId,
      amount: '£27.00',
      giftDate: '2026-04-11T10:10:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 004',
      donorFirstName: 'Jamie',
      donorLastName: 'Taylor',
      donorEmail: 'jamie.taylor@example.org',
      amount: '£85.00',
      giftDate: '2026-04-11T10:15:00.000Z',
      donorResolutionState: 'AMBIGUOUS',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 005',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      donorId: donors.adaId,
      amount: '£63.00',
      giftDate: '2026-04-11T10:20:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: true,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 006',
      donorFirstName: 'Chris',
      donorLastName: 'Bennett',
      donorEmail: 'chris.bennett@example.org',
      donorId: donors.chrisId,
      amount: '£51.00',
      giftDate: '2026-04-11T10:25:00.000Z',
      donorResolutionState: 'UNRESOLVED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 007',
      donorFirstName: 'Elliot',
      donorLastName: 'Meyer',
      donorEmail: 'elliot.meyer@example.org',
      donorId: donors.elliotId,
      amount: '£44.00',
      giftDate: '2026-04-11T10:30:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'FAILED',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'PROCESS_FAILED',
      errorDetail: 'Previous executor run failed for this row.',
      batchName: 'Executor mixed readiness stress',
    }),
    buildSeedRow({
      name: 'Mixed readiness row 008',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      donorId: donors.adaId,
      amount: '£92.00',
      giftDate: '2026-04-11T10:35:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor mixed readiness stress',
    }),
  ];
};

const buildSplitFallbackStressRows = (
  donors: {
    adaId: string | null;
    chrisId: string | null;
    elliotId: string | null;
  },
): SeedStagingRow[] => {
  const cleanRows = Array.from({ length: 8 }, (_, index) => {
    const donorSet =
      index % 3 === 0
        ? {
            firstName: 'Ada',
            lastName: 'Lovelace',
            email: 'ada.lovelace@example.org',
            donorId: donors.adaId,
          }
        : index % 3 === 1
          ? {
              firstName: 'Chris',
              lastName: 'Bennett',
              email: 'chris.bennett@example.org',
              donorId: donors.chrisId,
            }
          : {
              firstName: 'Elliot',
              lastName: 'Meyer',
              email: 'elliot.meyer@example.org',
              donorId: donors.elliotId,
            };

    return buildSeedRow({
      name: `Split fallback row ${String(index + 1).padStart(3, '0')}`,
      donorFirstName: donorSet.firstName,
      donorLastName: donorSet.lastName,
      donorEmail: donorSet.email,
      donorId: donorSet.donorId,
      amount: `£${(40 + index * 4).toFixed(2)}`,
      giftDate: `2026-04-${String(12 + index).padStart(2, '0')}T09:00:00.000Z`,
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor split fallback stress',
    });
  });

  return [
    ...cleanRows,
    buildSeedRow({
      name: 'Split fallback bad row 009',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      donorId: donors.adaId,
      amount: '£invalid',
      giftDate: '2026-04-20T09:00:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Executor split fallback stress',
    }),
  ];
};

const handler = async () => {
  const client = new CoreApiClient();
  const peopleByEmail = await ensureSeedPeople(client);
  const batchesByName = await ensureGiftBatches(client);
  const existingRows = await loadExistingStagingRows(client);
  const existingRowNames = await loadExistingStagingRowNames(client);

  const ada = peopleByEmail.get('ada.lovelace@example.org');
  const chris = peopleByEmail.get('chris.bennett@example.org');
  const elliot = peopleByEmail.get('elliot.meyer@example.org');

  const seedRows: SeedStagingRow[] = [
    {
      name: 'CAF import row 001',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      amount: '£45.00',
      giftDate: '2026-04-10T09:30:00.000Z',
      donorResolutionState: 'UNREVIEWED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      giftAidRequested: true,
      giftAidDeclarationCaptured: false,
      batchName: 'April import batch',
    },
    {
      name: 'Website donation row 014',
      donorFirstName: 'Chris',
      donorLastName: 'Bennett',
      donorEmail: 'chris.bennett@example.org',
      donorId: chris?.id ?? null,
      amount: '£18.50',
      giftDate: '2026-04-09T15:45:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: true,
      processingStatus: 'PENDING',
      errorDetail: null,
      giftAidRequested: true,
      giftAidDeclarationCaptured: true,
      giftAidDeclarationDate: '2026-04-09',
      giftAidCoverageScope: 'past_and_future',
      giftAidDeclarationSource: 'website',
      giftAidTextVersion: 'v1',
      batchName: 'April import batch',
    },
    {
      name: 'Postal response row 023',
      donorFirstName: 'Jamie',
      donorLastName: 'Taylor',
      donorEmail: 'jamie.taylor@example.org',
      amount: '£120.00',
      giftDate: '2026-04-08T12:00:00.000Z',
      donorResolutionState: 'AMBIGUOUS',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'April import batch',
    },
    {
      name: 'Standing order row 031',
      donorFirstName: 'Elliot',
      donorLastName: 'Meyer',
      donorEmail: 'elliot.meyer@example.org',
      donorId: elliot?.id ?? null,
      amount: '£75.00',
      giftDate: '2026-04-07T08:15:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'FAILED',
      hasCoreGiftIssue: false,
      isReadyForProcessing: false,
      processingStatus: 'PROCESS_FAILED',
      errorDetail: 'Previous processing attempt failed: missing coding context.',
      batchName: 'Standing orders follow-up',
    },
    {
      name: 'Bank file row 044',
      donorFirstName: 'Ada',
      donorLastName: 'Lovelace',
      donorEmail: 'ada.lovelace@example.org',
      donorId: ada?.id ?? null,
      amount: '£62.00',
      giftDate: '2026-04-06T11:20:00.000Z',
      donorResolutionState: 'CONFIRMED',
      processingOutcome: 'NOT_RUN',
      hasCoreGiftIssue: true,
      isReadyForProcessing: false,
      processingStatus: 'NOT_READY',
      errorDetail: null,
      batchName: 'Standing orders follow-up',
    },
    ...buildCleanStressRows([
      {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada.lovelace@example.org',
        donorId: ada?.id ?? null,
      },
      {
        firstName: 'Chris',
        lastName: 'Bennett',
        email: 'chris.bennett@example.org',
        donorId: chris?.id ?? null,
      },
      {
        firstName: 'Elliot',
        lastName: 'Meyer',
        email: 'elliot.meyer@example.org',
        donorId: elliot?.id ?? null,
      },
    ]),
    ...buildMixedReadinessStressRows({
      adaId: ada?.id ?? null,
      chrisId: chris?.id ?? null,
      elliotId: elliot?.id ?? null,
    }),
    ...buildSplitFallbackStressRows({
      adaId: ada?.id ?? null,
      chrisId: chris?.id ?? null,
      elliotId: elliot?.id ?? null,
    }),
  ];

  const rowsToCreate = seedRows.filter((row) => !existingRowNames.has(row.name));

  if (rowsToCreate.length > 0) {
    await client.mutation({
      createStagingReviewItems: {
        __args: {
          data: rowsToCreate.map((row) => ({
            name: row.name,
            donorFirstName: row.donorFirstName,
            donorLastName: row.donorLastName,
            donorEmail: row.donorEmail,
            ...(row.donorId ? { donorId: row.donorId } : {}),
            amount: row.amount,
            giftDate: row.giftDate,
            donorResolutionState: row.donorResolutionState,
            processingOutcome: row.processingOutcome,
            hasCoreGiftIssue: row.hasCoreGiftIssue,
            isReadyForProcessing: row.isReadyForProcessing,
            processingStatus: row.processingStatus,
            errorDetail: row.errorDetail,
            giftAidRequested: row.giftAidRequested ?? false,
            giftAidDeclarationCaptured: row.giftAidDeclarationCaptured ?? false,
            giftAidDeclarationDate: row.giftAidDeclarationDate ?? null,
            giftAidCoverageScope: row.giftAidCoverageScope ?? null,
            giftAidDeclarationSource: row.giftAidDeclarationSource ?? null,
            giftAidTextVersion: row.giftAidTextVersion ?? null,
            giftBatchId: batchesByName.get(row.batchName)?.id ?? null,
          })) as any,
        },
        id: true,
      },
    } as any);
  }

  const existingRowsByName = new Map(
    existingRows.map((row) => [row.name, row] as const),
  );

  for (const row of seedRows) {
    const existing = existingRowsByName.get(row.name);

    if (!existing) {
      continue;
    }

    await client.mutation({
      updateStagingReviewItem: {
        __args: {
          id: existing.id,
          data: {
            donorFirstName: row.donorFirstName,
            donorLastName: row.donorLastName,
            donorEmail: row.donorEmail,
            ...(row.donorId ? { donorId: row.donorId } : {}),
            amount: row.amount,
            giftDate: row.giftDate,
            donorResolutionState: row.donorResolutionState,
            processingOutcome: row.processingOutcome,
            hasCoreGiftIssue: row.hasCoreGiftIssue,
            isReadyForProcessing: row.isReadyForProcessing,
            processingStatus: row.processingStatus,
            errorDetail: row.errorDetail,
            giftAidRequested: row.giftAidRequested ?? false,
            giftAidDeclarationCaptured: row.giftAidDeclarationCaptured ?? false,
            giftAidDeclarationDate: row.giftAidDeclarationDate ?? null,
            giftAidCoverageScope: row.giftAidCoverageScope ?? null,
            giftAidDeclarationSource: row.giftAidDeclarationSource ?? null,
            giftAidTextVersion: row.giftAidTextVersion ?? null,
            giftBatchId: batchesByName.get(row.batchName)?.id ?? null,
          },
        },
        id: true,
      },
    } as any);
  }

  console.log('Seeded staged gift rows, gift batches, and donor records.');
  return {};
};

export default definePostInstallLogicFunction({
  universalIdentifier: '2b9f3875-26a2-4cb3-9295-7e463ee89044',
  name: 'post-install',
  description:
    'Seeds staged gift rows, gift batches, and matching Twenty person records for fundraising workflow testing.',
  timeoutSeconds: 60,
  handler,
});
