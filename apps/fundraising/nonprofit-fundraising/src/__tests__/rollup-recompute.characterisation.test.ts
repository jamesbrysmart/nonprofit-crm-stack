// Characterises what each giving rollup writes, end to end through its recompute
// pipeline, before the rollups are consolidated (docs/apps-migration/
// ROLLUP_CONSOLIDATION_DESIGN.md). Only the adapter below should change when the
// new engine replaces the four modules; the expectations must not.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  createFakeRollupWorkspace,
  type FakeRow,
  type FakeTableName,
} from './fake-rollup-workspace';

const workspaceRef = vi.hoisted(() => ({
  current: null as null | {
    postTwentyRest: (input: { path: string; body: unknown }) => Promise<unknown>;
  },
}));

vi.mock('src/app-api/twenty-rest-client', () => ({
  postTwentyRest: (input: { path: string; body: unknown }) => {
    if (!workspaceRef.current) {
      throw new Error('No fake workspace');
    }

    return workspaceRef.current.postTwentyRest(input);
  },
}));

import {
  recomputeAllAppealRollups,
  recomputeAppealRollups,
} from 'src/appeal-rollups/appeal-rollups';
import {
  recomputeAllAppealSourceRollups,
  recomputeAppealSourceRollups,
} from 'src/appeal-source-rollups/appeal-source-rollups';
import {
  recomputeAllCompanyRollups,
  recomputeCompanyRollups,
} from 'src/company-rollups/company-rollups';
import {
  recomputeAllDonorRollups,
  recomputeDonorRollups,
} from 'src/donor-rollups/donor-rollups';

type RollupKind = 'donor' | 'company' | 'appeal' | 'appealSource';

// The only part that changes when the consolidated engine lands.
const recomputeTargets = (
  kind: RollupKind,
  client: CoreApiClient,
  ids: string[],
) =>
  ({
    donor: recomputeDonorRollups,
    company: recomputeCompanyRollups,
    appeal: recomputeAppealRollups,
    appealSource: recomputeAppealSourceRollups,
  })[kind](client, ids);

const recomputeAll = (kind: RollupKind, client: CoreApiClient) =>
  ({
    donor: recomputeAllDonorRollups,
    company: recomputeAllCompanyRollups,
    appeal: recomputeAllAppealRollups,
    appealSource: recomputeAllAppealSourceRollups,
  })[kind](client);

const TABLE_BY_KIND: Record<RollupKind, FakeTableName> = {
  donor: 'people',
  company: 'companies',
  appeal: 'appeals',
  appealSource: 'appealSources',
};

const gbp = (pounds: number) => ({
  amountMicros: pounds * 1_000_000,
  currencyCode: 'GBP',
});

const gift = (
  id: string,
  fields: Partial<{
    donorId: string;
    companyId: string;
    appealId: string;
    appealSourceId: string;
    giftDate: string;
    giftType: string;
    amount: { amountMicros: number; currencyCode: string };
    reportingAmount: { amountMicros: number; currencyCode: string };
  }>,
): FakeRow => ({
  id,
  donorId: null,
  companyId: null,
  appealId: null,
  appealSourceId: null,
  giftType: 'DONATION',
  reportingAmount: null,
  ...fields,
});

// One fixture exercises every rule in §6 of the design:
// - g1 counts everywhere.
// - g2 is in EUR, with a GBP reporting amount and a timestamped date.
// - g3 is a gift in kind (excluded from every rollup).
// - g4 is in USD with no reporting value: it counts, but is left out of money totals.
const GIFTS: FakeRow[] = [
  gift('g1', {
    donorId: 'p1',
    companyId: 'c1',
    appealId: 'a1',
    appealSourceId: 's1',
    giftDate: '2026-01-10',
    amount: gbp(50),
  }),
  gift('g2', {
    donorId: 'p1',
    appealId: 'a1',
    giftDate: '2026-03-05T12:00:00.000Z',
    amount: { amountMicros: 40_000_000, currencyCode: 'EUR' },
    reportingAmount: gbp(34),
  }),
  gift('g3', {
    donorId: 'p1',
    appealId: 'a1',
    giftDate: '2026-04-01',
    giftType: 'GIFT_IN_KIND',
    amount: gbp(100),
  }),
  gift('g4', {
    donorId: 'p4',
    companyId: 'c1',
    appealId: 'a1',
    giftDate: '2026-02-20T09:30:00.000Z',
    amount: { amountMicros: 30_000_000, currencyCode: 'USD' },
  }),
];

const OPPORTUNITIES: FakeRow[] = [
  {
    id: 'o1',
    companyId: 'c1',
    awardedAmount: gbp(1000),
    applicationDeadline: '2026-12-01',
    fundingPeriodEnd: '2027-06-30',
  },
  {
    id: 'o2',
    companyId: 'c1',
    awardedAmount: { amountMicros: 500_000_000, currencyCode: 'USD' },
    applicationDeadline: '2026-10-01',
    fundingPeriodEnd: null,
  },
  {
    id: 'o3',
    companyId: 'c1',
    awardedAmount: null,
    applicationDeadline: '2026-12-15',
    fundingPeriodEnd: null,
  },
  {
    id: 'o4',
    companyId: 'c2',
    awardedAmount: gbp(200),
    applicationDeadline: null,
    fundingPeriodEnd: null,
  },
];

const EXPECTED_DONOR_P1 = {
  id: 'p1',
  lifetimeGiftAmount: gbp(84),
  giftCount: 2,
  firstGiftDate: '2026-01-10',
  lastGiftDate: '2026-03-05T12:00:00.000Z',
  lastGiftAmount: { amountMicros: 40_000_000, currencyCode: 'EUR' },
  largestGiftAmount: gbp(50),
};

const EXPECTED_DONOR_P4 = {
  id: 'p4',
  lifetimeGiftAmount: gbp(0),
  giftCount: 1,
  firstGiftDate: '2026-02-20T09:30:00.000Z',
  lastGiftDate: '2026-02-20T09:30:00.000Z',
  lastGiftAmount: { amountMicros: 30_000_000, currencyCode: 'USD' },
  largestGiftAmount: null,
};

const EXPECTED_COMPANY_C1 = {
  id: 'c1',
  lifetimeGiftAmount: gbp(50),
  lastGiftDate: '2026-02-20',
  awardedOpportunityAmount: gbp(1000),
  awardedOpportunityCount: 2,
  nextApplicationDeadline: '2026-12-01',
  nextFundingPeriodEnd: '2027-06-30',
};

const EXPECTED_APPEAL_A1 = {
  id: 'a1',
  raisedAmount: gbp(84),
  giftCount: 3,
  donorCount: 3,
  lastGiftAt: '2026-03-05T12:00:00.000Z',
};

const EXPECTED_SOURCE_S1 = {
  id: 's1',
  raisedAmount: gbp(50),
  giftCount: 1,
  donorCount: 2,
  lastGiftAt: '2026-01-10',
};

const freshWorkspace = (extra: Partial<Record<FakeTableName, FakeRow[]>> = {}) => {
  const workspace = createFakeRollupWorkspace({
    people: [{ id: 'p1' }, { id: 'p4' }],
    companies: [{ id: 'c1' }, { id: 'c2' }],
    appeals: [{ id: 'a1' }],
    appealSources: [{ id: 's1' }],
    gifts: GIFTS,
    opportunities: OPPORTUNITIES,
    ...extra,
  });
  workspaceRef.current = workspace;

  return {
    ...workspace,
    client: workspace.client as unknown as CoreApiClient,
  };
};

const writtenRows = (workspace: ReturnType<typeof freshWorkspace>) =>
  workspace.writes.flatMap((write) => write.body);

describe('giving rollups: recompute characterisation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-25T12:00:00.000Z'));
    vi.stubEnv('REPORTING_CURRENCY', 'GBP');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    workspaceRef.current = null;
  });

  describe('targeted recompute writes the expected summary', () => {
    it.each([
      ['donor', ['p1', 'p4'], [EXPECTED_DONOR_P1, EXPECTED_DONOR_P4]],
      ['company', ['c1'], [EXPECTED_COMPANY_C1]],
      ['appeal', ['a1'], [EXPECTED_APPEAL_A1]],
      ['appealSource', ['s1'], [EXPECTED_SOURCE_S1]],
    ] as const)('%s', async (kind, ids, expected) => {
      const workspace = freshWorkspace();

      await recomputeTargets(kind, workspace.client, [...ids]);

      expect(workspace.writes.map((write) => write.table)).toEqual([
        TABLE_BY_KIND[kind],
      ]);
      expect(writtenRows(workspace)).toEqual(expected);
    });
  });

  it.each(['donor', 'company', 'appeal', 'appealSource'] as const)(
    '%s: a second run writes nothing when values are already current',
    async (kind) => {
      const workspace = freshWorkspace();
      const ids = workspace.store[TABLE_BY_KIND[kind]].map((row) => row.id);

      await recomputeTargets(kind, workspace.client, ids);
      const writesAfterFirstRun = workspace.writes.length;
      await recomputeTargets(kind, workspace.client, ids);

      expect(workspace.writes.length).toBe(writesAfterFirstRun);
    },
  );

  it.each(['donor', 'company', 'appeal', 'appealSource'] as const)(
    '%s: ignores ids that have no record and normalises the id list',
    async (kind) => {
      const workspace = freshWorkspace();

      await recomputeTargets(kind, workspace.client, ['  ', 'missing']);

      expect(workspace.writes).toEqual([]);
    },
  );

  it('company: counts and totals opportunities even without gifts', async () => {
    const workspace = freshWorkspace();

    await recomputeTargets('company', workspace.client, ['c2']);

    expect(writtenRows(workspace)).toEqual([
      {
        id: 'c2',
        lifetimeGiftAmount: gbp(0),
        lastGiftDate: null,
        awardedOpportunityAmount: gbp(200),
        awardedOpportunityCount: 1,
        nextApplicationDeadline: null,
        nextFundingPeriodEnd: null,
      },
    ]);
  });

  describe('full recompute resets records that no longer have gifts', () => {
    it.each([
      [
        'donor',
        { id: 'p9', giftCount: 3, lastGiftDate: '2025-01-01' },
        {
          id: 'p9',
          lifetimeGiftAmount: gbp(0),
          giftCount: 0,
          firstGiftDate: null,
          lastGiftDate: null,
          lastGiftAmount: null,
          largestGiftAmount: null,
        },
      ],
      [
        'company',
        { id: 'c9', lastGiftDate: '2025-01-01' },
        {
          id: 'c9',
          lifetimeGiftAmount: gbp(0),
          lastGiftDate: null,
          awardedOpportunityAmount: gbp(0),
          awardedOpportunityCount: 0,
          nextApplicationDeadline: null,
          nextFundingPeriodEnd: null,
        },
      ],
      [
        'appeal',
        { id: 'a9', giftCount: 2 },
        {
          id: 'a9',
          raisedAmount: gbp(0),
          giftCount: 0,
          donorCount: 0,
          lastGiftAt: null,
        },
      ],
      [
        'appealSource',
        { id: 's9', giftCount: 2 },
        {
          id: 's9',
          raisedAmount: gbp(0),
          giftCount: 0,
          donorCount: 0,
          lastGiftAt: null,
        },
      ],
    ] as const)('%s', async (kind, staleRecord, expectedReset) => {
      const table = TABLE_BY_KIND[kind];
      const workspace = freshWorkspace();
      workspace.store[table].push({ ...staleRecord });

      await recomputeAll(kind, workspace.client);

      expect(writtenRows(workspace)).toContainEqual(expectedReset);
    });
  });

  it.each(['donor', 'company', 'appeal', 'appealSource'] as const)(
    '%s: full recompute covers every record with gifts',
    async (kind) => {
      const workspace = freshWorkspace();

      await recomputeAll(kind, workspace.client);

      const expectedIds = {
        donor: ['p1', 'p4'],
        company: ['c1', 'c2'],
        appeal: ['a1'],
        appealSource: ['s1'],
      }[kind];
      expect(writtenRows(workspace).map((row) => row.id).sort()).toEqual(
        expectedIds,
      );
    },
  );

  it.each(['donor', 'company', 'appeal', 'appealSource'] as const)(
    '%s: leaves money fields untouched without a reporting currency',
    async (kind) => {
      vi.stubEnv('REPORTING_CURRENCY', '');
      const workspace = freshWorkspace();
      const ids = workspace.store[TABLE_BY_KIND[kind]].map((row) => row.id);

      await recomputeTargets(kind, workspace.client, ids);

      const moneyFields = [
        'lifetimeGiftAmount',
        'largestGiftAmount',
        'awardedOpportunityAmount',
        'raisedAmount',
      ];
      for (const row of writtenRows(workspace)) {
        for (const field of moneyFields) {
          expect(row).not.toHaveProperty(field);
        }
      }
      expect(writtenRows(workspace).length).toBeGreaterThan(0);
    },
  );
});
