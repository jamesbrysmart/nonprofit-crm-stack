import { describe, expect, it } from 'vitest';
import { themeCssVariables } from 'twenty-ui/theme';
import { theme } from 'src/front-components/theme-tokens';

describe('theme tokens', () => {
  it('match the variables twenty-ui defines', () => {
    expect(themeCssVariables).toMatchObject(theme);
  });
});
