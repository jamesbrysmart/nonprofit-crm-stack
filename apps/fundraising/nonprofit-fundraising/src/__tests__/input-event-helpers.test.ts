import { describe, expect, it } from 'vitest';
import {
  getInputEventChecked,
  getInputEventValue,
} from 'src/manual-gift-entry/new-gift-support';

describe('input event helpers', () => {
  it('read the value the renderer applies to event.target', () => {
    expect(getInputEventValue({ target: { value: 'Acme Trust' } })).toBe(
      'Acme Trust',
    );
    expect(getInputEventValue({ target: { value: 25 } })).toBe('25');
  });

  it('read the checked state the renderer applies to event.target', () => {
    expect(getInputEventChecked({ target: { checked: true } })).toBe(true);
    expect(getInputEventChecked({ target: { checked: false } })).toBe(false);
  });

  it('treat events without a target as empty', () => {
    expect(getInputEventValue({ detail: { value: 'ignored' } })).toBe('');
    expect(getInputEventValue(null)).toBe('');
    expect(getInputEventChecked({})).toBe(false);
  });
});
