import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import {
  buildExactNameKey,
  loadPeopleByExactNames,
} from 'src/donor-resolution/donor-candidate-discovery';

const person = (id: string, firstName: string, lastName: string) => ({
  id,
  name: { firstName, lastName },
  emails: { primaryEmail: null },
});

const page = (people: unknown[], endCursor?: string) => ({
  people: {
    edges: people.map((node) => ({ node })),
    pageInfo: { hasNextPage: endCursor !== undefined, endCursor },
  },
});

describe('loadPeopleByExactNames', () => {
  it('groups matches back to each name, case-insensitively, across pages', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        page([person('p1', 'Ada', 'Lovelace'), person('p2', 'ada', 'LOVELACE')], 'c1'),
      )
      .mockResolvedValueOnce(page([person('p3', 'Grace', 'Hopper')]));
    const client = { query } as unknown as CoreApiClient;

    const result = await loadPeopleByExactNames({
      client,
      names: [
        { firstName: ' Ada ', lastName: 'Lovelace' },
        { firstName: 'Grace', lastName: 'Hopper' },
        { firstName: 'Ada', lastName: 'Lovelace' },
        { firstName: '', lastName: 'Nobody' },
      ],
    });

    expect(query).toHaveBeenCalledTimes(2);
    expect(result.get(buildExactNameKey('Ada', 'Lovelace'))?.map((p) => p.id)).toEqual([
      'p1',
      'p2',
    ]);
    expect(result.get(buildExactNameKey('grace', 'hopper'))?.map((p) => p.id)).toEqual(['p3']);
    expect(result.has(buildExactNameKey('', 'Nobody'))).toBe(false);
  });

  it('caps candidates per name and queries names in groups of 25', async () => {
    const query = vi.fn().mockImplementation(async () =>
      page(Array.from({ length: 60 }, (_, index) => person(`p${index}`, 'Sam', 'Smith'))),
    );
    const client = { query } as unknown as CoreApiClient;
    const names = Array.from({ length: 30 }, (_, index) => ({
      firstName: index === 0 ? 'Sam' : `Name${index}`,
      lastName: 'Smith',
    }));

    const result = await loadPeopleByExactNames({ client, names });

    expect(query).toHaveBeenCalledTimes(2);
    expect(result.get(buildExactNameKey('Sam', 'Smith'))).toHaveLength(50);
  });
});
