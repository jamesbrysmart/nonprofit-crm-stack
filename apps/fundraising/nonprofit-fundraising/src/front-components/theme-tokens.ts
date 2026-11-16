// Twenty theme CSS variables, mirroring twenty-ui's themeCssVariables. Module-level
// styles cannot read twenty-ui/theme because the CLI mocks twenty-ui while it
// extracts the manifest; theme-tokens.test.ts checks these against twenty-ui.
export const theme = {
  background: {
    primary: 'var(--t-background-primary)',
    secondary: 'var(--t-background-secondary)',
    transparent: {
      light: 'var(--t-background-transparent-light)',
    },
  },
  border: {
    color: {
      light: 'var(--t-border-color-light)',
      medium: 'var(--t-border-color-medium)',
    },
    radius: {
      pill: 'var(--t-border-radius-pill)',
    },
  },
  color: {
    blue: 'var(--t-color-blue)',
    blue3: 'var(--t-color-blue3)',
    green3: 'var(--t-color-green3)',
    green9: 'var(--t-color-green9)',
    green11: 'var(--t-color-green11)',
    red3: 'var(--t-color-red3)',
    red11: 'var(--t-color-red11)',
    yellow3: 'var(--t-color-yellow3)',
    yellow11: 'var(--t-color-yellow11)',
  },
  font: {
    color: {
      primary: 'var(--t-font-color-primary)',
      secondary: 'var(--t-font-color-secondary)',
      tertiary: 'var(--t-font-color-tertiary)',
    },
  },
} as const;
