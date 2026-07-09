import { describe, expect, it } from 'vitest';
import { findPrimaryEmailCandidate } from 'src/manual-gift-entry/new-gift-support';

describe('new gift support', () => {
  it('finds primary email candidates case-insensitively', () => {
    const candidate = {
      id: 'person_1',
      name: {
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
      emails: {
        primaryEmail: 'ada@example.org',
      },
    };

    expect(
      findPrimaryEmailCandidate([candidate], ' ADA@example.org '),
    ).toEqual(candidate);
  });

  it('ignores non-matching or blank email input', () => {
    const candidate = {
      id: 'person_1',
      emails: {
        primaryEmail: 'ada@example.org',
      },
    };

    expect(findPrimaryEmailCandidate([candidate], '')).toBeNull();
    expect(findPrimaryEmailCandidate([candidate], 'grace@example.org')).toBeNull();
  });
});
