import { CoreApiClient } from 'twenty-client-sdk/core';

import { type ProgrammeOverviewData } from 'src/front-components/types/programme-overview-data';

const PAGE_SIZE = 100;

const fullName = (name: { firstName?: string | null; lastName?: string | null } | null | undefined) =>
  [name?.firstName, name?.lastName].filter(Boolean).join(' ');

// Loads a programme with its roles, events and opportunities, then every gift to its funds.
export const loadProgrammeOverview = async (programmeId: string): Promise<ProgrammeOverviewData | null> => {
  const client = new CoreApiClient();
  const { programme } = await client.query({
    programme: {
      __args: { filter: { id: { eq: programmeId } } },
      name: true,
      tagline: true,
      discipline: true,
      status: true,
      funds: { __args: { first: PAGE_SIZE }, edges: { node: { id: true } } },
      programmeRoles: {
        __args: { first: PAGE_SIZE },
        edges: { node: { artisticRole: true, status: true, cohort: true, person: { name: { firstName: true, lastName: true } } } },
      },
      foundationEvents: {
        __args: { first: PAGE_SIZE },
        edges: { node: { id: true, name: true, startsAt: true, status: true, acceptedCount: true, capacity: true } },
      },
      opportunities: {
        __args: { first: PAGE_SIZE },
        edges: { node: { stage: true, amount: { amountMicros: true } } },
      },
    },
  });
  if (!programme) return null;

  const fundIds = (programme.funds?.edges ?? []).map((edge) => edge.node.id);
  const gifts: ProgrammeOverviewData['gifts'] = [];
  let after: string | null = null;
  while (fundIds.length > 0) {
    const page: Awaited<ReturnType<typeof loadGiftPage>> = await loadGiftPage(client, fundIds, after);
    gifts.push(
      ...(page.gifts?.edges ?? []).map(({ node }) => ({
        amountMicros: node.amount?.amountMicros ?? null,
        donorId: node.donor?.id ?? null,
        donorName: node.donor ? fullName(node.donor.name) : null,
        companyId: node.company?.id ?? null,
        companyName: node.company?.name ?? null,
      })),
    );
    if (!page.gifts?.pageInfo?.hasNextPage) break;
    after = page.gifts.pageInfo.endCursor ?? null;
  }

  return {
    programme: {
      name: programme.name ?? '',
      tagline: programme.tagline ?? null,
      discipline: programme.discipline ?? null,
      status: programme.status ?? null,
    },
    roles: (programme.programmeRoles?.edges ?? []).map(({ node }) => ({
      personName: fullName(node.person?.name),
      artisticRole: node.artisticRole ?? null,
      status: node.status ?? null,
      cohort: node.cohort ?? null,
    })),
    events: (programme.foundationEvents?.edges ?? []).map(({ node }) => ({
      id: node.id,
      name: node.name ?? '',
      startsAt: node.startsAt ?? null,
      status: node.status ?? null,
      acceptedCount: node.acceptedCount ?? null,
      capacity: node.capacity ?? null,
    })),
    opportunities: (programme.opportunities?.edges ?? []).map(({ node }) => ({
      amountMicros: node.amount?.amountMicros ?? null,
      stage: node.stage ?? null,
    })),
    gifts,
  };
};

const loadGiftPage = (client: CoreApiClient, fundIds: string[], after: string | null) =>
  client.query({
    gifts: {
      __args: { filter: { fundId: { in: fundIds } }, first: PAGE_SIZE, ...(after ? { after } : {}) },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: {
          amount: { amountMicros: true },
          donor: { id: true, name: { firstName: true, lastName: true } },
          company: { id: true, name: true },
        },
      },
    },
  });
