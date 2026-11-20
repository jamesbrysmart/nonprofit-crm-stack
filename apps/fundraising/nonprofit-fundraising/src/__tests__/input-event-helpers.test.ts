import { describe, expect, it } from 'vitest';
import { getInputEventValue } from 'src/manual-gift-entry/new-gift-support';

describe('input event helpers', () => {
  it('read the value the renderer applies to event.target', () => {
    expect(getInputEventValue({ target: { value: 'Acme Trust' } })).toBe(
      'Acme Trust',
    );
    expect(getInputEventValue({ target: { value: 25 } })).toBe('25');
  });

  it('treat events without a target as empty', () => {
    expect(getInputEventValue({ detail: { value: 'ignored' } })).toBe('');
    expect(getInputEventValue(null)).toBe('');
  });
});
