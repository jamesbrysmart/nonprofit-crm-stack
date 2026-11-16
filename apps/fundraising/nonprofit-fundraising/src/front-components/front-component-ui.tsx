import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { theme } from 'src/front-components/theme-tokens';

export const panelStackStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  padding: '16px',
};

export const cardStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: theme.background.primary,
};

export const cardWithLooseGapStyle: CSSProperties = {
  ...cardStyle,
  gap: '16px',
};

export const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.font.color.tertiary,
  fontWeight: 500,
};

export const valueStyle: CSSProperties = {
  fontSize: '15px',
  color: theme.font.color.primary,
  lineHeight: 1.4,
};

export const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.font.color.secondary,
  lineHeight: 1.5,
};

export const fieldStackStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

export const fieldGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
};

export const detailsGridStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
};

export const actionRowStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

export type ActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'color'
> & {
  title: ReactNode;
  variant?: 'primary' | 'secondary';
  accent?: 'default' | 'blue';
};

// Keeps the app's existing button API while rendering Twenty's own Button.
export const ActionButton = ({
  title,
  variant = 'secondary',
  accent,
  type = 'button',
  ...props
}: ActionButtonProps) => {
  const effectiveAccent = accent ?? (variant === 'primary' ? 'blue' : 'default');

  return (
    <Button
      {...props}
      type={type}
      size="sm"
      variant={variant === 'primary' ? 'solid' : 'outline'}
      color={effectiveAccent === 'blue' ? 'accent' : 'neutral'}
    >
      {title}
    </Button>
  );
};

export const inputStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  color: theme.font.color.primary,
  background: theme.background.primary,
  width: '100%',
  boxSizing: 'border-box',
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '96px',
  resize: 'vertical',
};

export const subtlePanelStyle: CSSProperties = {
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '12px',
  display: 'grid',
  gap: '8px',
  background: theme.background.primary,
};

export const badgeStyle = (
  tone: 'neutral' | 'warning' | 'success' | 'danger',
): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: theme.border.radius.pill,
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  background:
    tone === 'success'
      ? theme.color.green3
      : tone === 'danger'
        ? theme.color.red3
        : tone === 'warning'
          ? theme.color.yellow3
          : theme.background.transparent.light,
  color:
    tone === 'success'
      ? theme.color.green11
      : tone === 'danger'
        ? theme.color.red11
        : tone === 'warning'
          ? theme.color.yellow11
          : theme.font.color.secondary,
});

export const pillButtonStyle = (selected: boolean): CSSProperties => ({
  border: `1px solid ${selected ? theme.color.green9 : theme.border.color.medium}`,
  background: selected ? theme.color.green3 : theme.background.primary,
  color: selected ? theme.color.green11 : theme.font.color.primary,
  borderRadius: theme.border.radius.pill,
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
});

export const signalPillStyle: CSSProperties = {
  ...secondaryTextStyle,
  fontSize: '13px',
  padding: '4px 10px',
  borderRadius: theme.border.radius.pill,
  background: theme.background.primary,
  border: `1px solid ${theme.border.color.medium}`,
};

export const choiceButtonStyle = (selected: boolean): CSSProperties => ({
  width: '100%',
  border: `1px solid ${selected ? theme.color.blue : theme.border.color.medium}`,
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'left',
  background: selected ? theme.color.blue3 : theme.background.primary,
  cursor: 'pointer',
  display: 'grid',
  gap: '4px',
});

export const reviewStateStyle = (
  accent: string,
  background: string,
): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: `1px solid ${accent}`,
  borderRadius: theme.border.radius.pill,
  padding: '8px 12px',
  background,
  color: theme.font.color.primary,
  fontSize: '14px',
  lineHeight: 1.3,
  fontWeight: 500,
});

export const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  flexWrap: 'wrap',
};

export const compactWidgetRootStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
  padding: '4px 8px',
};

export const compactDividerSectionStyle: CSSProperties = {
  display: 'grid',
  gap: '6px',
  paddingTop: '6px',
  borderTop: `1px solid ${theme.border.color.light}`,
};

export const compactConfirmationCardStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
  padding: '8px 10px',
  border: `1px solid ${theme.border.color.medium}`,
  borderRadius: '6px',
  background: theme.background.primary,
};

export const compactMetaGridStyle: CSSProperties = {
  display: 'grid',
  gap: '6px 12px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
};

export const compactMetaItemStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
};

export const compactValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: '14px',
};

export const summaryStripValueStyle: CSSProperties = {
  ...secondaryTextStyle,
};

export const contextSignalRowStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const contextMetricStyle: CSSProperties = {
  fontSize: '20px',
  lineHeight: 1.2,
  fontWeight: 650,
  color: theme.font.color.primary,
};

export const contextSummaryLineStyle: CSSProperties = {
  ...secondaryTextStyle,
  color: theme.font.color.secondary,
};

export const CompactMetaGrid = ({ children }: { children: ReactNode }) => (
  <div style={compactMetaGridStyle}>{children}</div>
);

export const CompactMetaItem = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
}) => (
  <div style={compactMetaItemStyle}>
    <div style={labelStyle}>{label}</div>
    {children ?? <div style={summaryStripValueStyle}>{value}</div>}
  </div>
);

export const summaryStripStyle: CSSProperties = {
  ...compactDividerSectionStyle,
};

export const SummaryStrip = ({ children }: { children: ReactNode }) => (
  <div style={summaryStripStyle}>
    <CompactMetaGrid>{children}</CompactMetaGrid>
  </div>
);

export const SummaryStripItem = ({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children?: ReactNode;
}) => (
  <CompactMetaItem label={label} value={value}>
    {children}
  </CompactMetaItem>
);

export const panelStyle: CSSProperties = {
  ...cardStyle,
  display: 'grid',
  gap: '16px',
};

export const linkStyle: CSSProperties = {
  color: theme.color.blue,
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
};

export const codeBlockStyle: CSSProperties = {
  margin: 0,
  padding: '10px 12px',
  borderRadius: '6px',
  border: `1px solid ${theme.border.color.medium}`,
  background: theme.background.secondary,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '12px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};
