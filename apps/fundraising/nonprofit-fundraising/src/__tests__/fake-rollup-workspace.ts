// In-memory stand-in for the Twenty API surface the giving rollups use: core
// connection queries (filter, first, after) and REST batch upserts. Shared by
// the rollup characterisation tests so they can run against the current
// modules and, unchanged, against the consolidated engine.

export type FakeRow = { id: string } & Record<string, unknown>;

export type FakeTableName =
  | 'people'
  | 'companies'
  | 'appeals'
  | 'appealSources'
  | 'gifts'
  | 'opportunities';

export type FakeWrite = { table: string; body: FakeRow[] };

type Filter = Record<string, unknown>;

const RELATIONS: Partial<Record<FakeTableName, Record<string, string>>> = {
  gifts: {
    donor: 'donorId',
    company: 'companyId',
    appeal: 'appealId',
    appealSource: 'appealSourceId',
  },
  opportunities: { company: 'companyId' },
};

const matchesCondition = (value: unknown, condition: unknown): boolean =>
  Object.entries(condition as Record<string, unknown>).every(
    ([operator, expected]) => {
      switch (operator) {
        case 'eq':
          return value === expected;
        case 'in':
          return (expected as unknown[]).includes(value);
        case 'gt':
          return typeof value === 'number' && value > (expected as number);
        case 'is':
          return expected === 'NULL'
            ? value === null || value === undefined
            : value !== null && value !== undefined;
        default:
          // Composite sub-field, for example { amountMicros: { is: 'NOT_NULL' } }.
          return matchesCondition(
            (value as Record<string, unknown> | null | undefined)?.[operator],
            expected,
          );
      }
    },
  );

const matchesFilter = (row: FakeRow, filter: Filter | undefined): boolean => {
  if (!filter) {
    return true;
  }

  return Object.entries(filter).every(([key, condition]) => {
    if (key === 'or') {
      return (condition as Filter[]).some((inner) => matchesFilter(row, inner));
    }
    if (key === 'and') {
      return (condition as Filter[]).every((inner) => matchesFilter(row, inner));
    }

    return matchesCondition(row[key], condition);
  });
};

const withRelations = (table: FakeTableName, row: FakeRow) => {
  const relations = RELATIONS[table] ?? {};
  const node: Record<string, unknown> = { ...row };

  for (const [relation, foreignKey] of Object.entries(relations)) {
    const id = row[foreignKey];
    node[relation] = typeof id === 'string' ? { id } : null;
  }

  return node;
};

export const createFakeRollupWorkspace = (
  tables: Partial<Record<FakeTableName, FakeRow[]>>,
) => {
  const store: Record<FakeTableName, FakeRow[]> = {
    people: [],
    companies: [],
    appeals: [],
    appealSources: [],
    gifts: [],
    opportunities: [],
    ...structuredClone(tables),
  };
  const writes: FakeWrite[] = [];
  const queries: FakeTableName[] = [];

  const query = async (request: Record<string, unknown>) => {
    const [table, spec] = Object.entries(request)[0] as [
      FakeTableName,
      { __args?: { filter?: Filter; first?: number; after?: string } },
    ];
    const rows = store[table];

    if (!rows) {
      throw new Error(`Fake workspace has no table ${table}`);
    }

    queries.push(table);
    const args = spec.__args ?? {};
    const matching = rows.filter((row) => matchesFilter(row, args.filter));
    const start = args.after ? Number(args.after) : 0;
    const first = args.first ?? matching.length;
    const page = matching.slice(start, start + first);

    return {
      [table]: {
        edges: page.map((row) => ({ node: withRelations(table, row) })),
        pageInfo: {
          hasNextPage: start + first < matching.length,
          endCursor: String(start + first),
        },
      },
    };
  };

  const postTwentyRest = async ({
    path,
    body,
  }: {
    path: string;
    body: unknown;
  }) => {
    const table = /\/rest\/batch\/([A-Za-z]+)/.exec(path)?.[1] as
      | FakeTableName
      | undefined;

    if (!table || !store[table]) {
      throw new Error(`Unexpected REST call ${path}`);
    }

    // Serialise as the real request would, which drops undefined fields.
    const rows = JSON.parse(JSON.stringify(body)) as FakeRow[];
    writes.push({ table, body: rows });

    for (const row of rows) {
      const existing = store[table].find((candidate) => candidate.id === row.id);
      if (existing) {
        Object.assign(existing, row);
      }
    }

    const responseKey = `create${table[0]?.toUpperCase()}${table.slice(1)}`;

    return { data: { [responseKey]: rows.map((row) => ({ id: row.id })) } };
  };

  return {
    client: {
      query,
      mutation: async () => {
        throw new Error('Rollups are not expected to use GraphQL mutations');
      },
    },
    postTwentyRest,
    writes,
    queries,
    store,
  };
};
