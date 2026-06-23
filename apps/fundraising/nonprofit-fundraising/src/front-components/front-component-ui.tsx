import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export const panelStackStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  padding: '16px',
};

export const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '8px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: '#ffffff',
};

export const cardWithLooseGapStyle: CSSProperties = {
  ...cardStyle,
  gap: '16px',
};

export const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
  fontWeight: 500,
};

export const valueStyle: CSSProperties = {
  fontSize: '15px',
  color: '#1f2328',
  lineHeight: 1.4,
};

export const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
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

export const actionButtonStyle = ({
  variant,
  accent = 'default',
  disabled,
}: {
  variant: 'primary' | 'secondary';
  accent?: 'default' | 'blue';
  disabled?: boolean;
}): CSSProperties => {
  const isBlue = accent === 'blue';
  const primaryBackground = isBlue
    ? 'var(--t-color-blue, #1967d2)'
    : 'var(--t-background-secondary, #f6f8fa)';
  const primaryColor = isBlue
    ? '#ffffff'
    : 'var(--t-font-color-secondary, #1f2328)';
  const secondaryColor = isBlue
    ? 'var(--t-color-blue, #1967d2)'
    : 'var(--t-font-color-secondary, #1f2328)';
  const secondaryBorder = isBlue
    ? 'var(--t-accent-primary, #1967d2)'
    : 'var(--t-background-transparent-medium, #d0d7de)';

  return {
    alignItems: 'center',
    background: variant === 'primary' ? primaryBackground : 'transparent',
    border:
      variant === 'primary'
        ? '1px solid var(--t-background-transparent-light, rgba(0, 0, 0, 0.08))'
        : `1px solid ${secondaryBorder}`,
    borderRadius: 'var(--t-border-radius-sm, 6px)',
    boxSizing: 'border-box',
    color: variant === 'primary' ? primaryColor : secondaryColor,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    font: 'inherit',
    fontFamily: 'var(--t-font-family, inherit)',
    fontSize: 'var(--t-font-size-md, 13px)',
    fontWeight: 500,
    gap: 'var(--t-spacing-1, 4px)',
    height: '32px',
    justifyContent: 'center',
    lineHeight: 1,
    opacity: disabled ? 0.55 : 1,
    padding: '0 var(--t-spacing-2, 8px)',
    textDecoration: 'none',
    transition: 'background 0.1s ease',
    whiteSpace: 'nowrap',
    width: 'auto',
  };
};

export type ActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  title: ReactNode;
  variant?: 'primary' | 'secondary';
  accent?: 'default' | 'blue';
};

export const ActionButton = ({
  title,
  variant = 'secondary',
  accent,
  disabled,
  type = 'button',
  style,
  ...props
}: ActionButtonProps) => {
  const effectiveAccent = accent ?? (variant === 'primary' ? 'blue' : 'default');

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      style={{
        ...actionButtonStyle({ variant, accent: effectiveAccent, disabled }),
        ...style,
      }}
    >
      {title}
    </button>
  );
};

export const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
  width: '100%',
  boxSizing: 'border-box',
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '96px',
  resize: 'vertical',
};

export const subtlePanelStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '6px',
  padding: '12px',
  display: 'grid',
  gap: '8px',
  background: '#ffffff',
};

export const badgeStyle = (
  tone: 'neutral' | 'warning' | 'success' | 'danger',
): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  background:
    tone === 'success'
      ? '#eef9f0'
      : tone === 'danger'
        ? '#ffebe9'
      : tone === 'warning'
        ? '#fff8c5'
        : '#f6f8fa',
  color:
    tone === 'success'
      ? '#1a7f37'
      : tone === 'danger'
        ? '#cf222e'
      : tone === 'warning'
        ? '#7c5700'
        : '#57606a',
});

export const pillButtonStyle = (selected: boolean): CSSProperties => ({
  border: selected ? '1px solid #0d7a5f' : '1px solid #d0d7de',
  background: selected ? '#e9f6f2' : '#ffffff',
  color: selected ? '#0d7a5f' : '#1f2328',
  borderRadius: '999px',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
});

export const signalPillStyle: CSSProperties = {
  ...secondaryTextStyle,
  fontSize: '13px',
  padding: '4px 10px',
  borderRadius: '999px',
  background: '#ffffff',
  border: '1px solid #d8dee4',
};

export const choiceButtonStyle = (selected: boolean): CSSProperties => ({
  width: '100%',
  border: selected ? '1px solid #1f6feb' : '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'left',
  background: selected ? '#eef4ff' : '#ffffff',
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
  borderRadius: '999px',
  padding: '8px 12px',
  background,
  color: '#1f2328',
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
  borderTop: '1px solid #e6e8eb',
};

export const compactConfirmationCardStyle: CSSProperties = {
  display: 'grid',
  gap: '4px',
  padding: '8px 10px',
  border: '1px solid #d8dee4',
  borderRadius: '6px',
  background: '#ffffff',
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
  color: '#1f2328',
};

export const contextSummaryLineStyle: CSSProperties = {
  ...secondaryTextStyle,
  color: '#57606a',
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
    {children ?? <div style={secondaryTextStyle}>{value}</div>}
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
  color: '#0969da',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
};

export const codeBlockStyle: CSSProperties = {
  margin: 0,
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d8dee4',
  background: '#f6f8fa',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '12px',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};
