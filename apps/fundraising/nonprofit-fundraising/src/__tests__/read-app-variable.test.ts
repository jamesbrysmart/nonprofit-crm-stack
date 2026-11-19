import { afterEach, describe, expect, it } from 'vitest';
import { readAppVariable } from 'src/app-variables/read-app-variable';

describe('readAppVariable', () => {
  afterEach(() => {
    delete process.env.REPORTING_CURRENCY;
    delete process.env.applicationVariables;
  });

  it('reads a logic-function variable from its own environment entry', () => {
    process.env.REPORTING_CURRENCY = 'EUR';

    expect(readAppVariable('REPORTING_CURRENCY')).toBe('EUR');
  });

  it('reads a front-component variable from the serialised set', () => {
    process.env.applicationVariables = JSON.stringify({
      REPORTING_CURRENCY: 'EUR',
    });

    expect(readAppVariable('REPORTING_CURRENCY')).toBe('EUR');
  });

  it('returns undefined when unset or malformed', () => {
    expect(readAppVariable('REPORTING_CURRENCY')).toBeUndefined();

    process.env.applicationVariables = '{not json';

    expect(readAppVariable('REPORTING_CURRENCY')).toBeUndefined();
  });
});
