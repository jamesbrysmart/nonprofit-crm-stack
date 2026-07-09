import { describe, expect, it } from 'vitest';
import { isInitialNameEvidenceMatch } from 'src/donor-resolution/donor-candidate-discovery';

describe('donor candidate discovery', () => {
  it('matches first initial and exact last name when one side is an initial', () => {
    expect(
      isInitialNameEvidenceMatch({
        leftFirstName: 'J',
        leftLastName: 'Smith',
        rightFirstName: 'John',
        rightLastName: 'smith',
      }),
    ).toBe(true);

    expect(
      isInitialNameEvidenceMatch({
        leftFirstName: 'Jane',
        leftLastName: 'Smith',
        rightFirstName: 'J',
        rightLastName: 'Smith',
      }),
    ).toBe(true);
  });

  it('does not match two full first names just because they share an initial', () => {
    expect(
      isInitialNameEvidenceMatch({
        leftFirstName: 'John',
        leftLastName: 'Smith',
        rightFirstName: 'James',
        rightLastName: 'Smith',
      }),
    ).toBe(false);
  });
});
