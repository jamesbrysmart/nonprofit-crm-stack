import type { CSSProperties } from 'react';

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

export const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
  width: '100%',
  boxSizing: 'border-box',
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
  tone: 'neutral' | 'warning' | 'success',
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
      : tone === 'warning'
        ? '#fff8c5'
        : '#f6f8fa',
  color:
    tone === 'success'
      ? '#1a7f37'
      : tone === 'warning'
        ? '#7c5700'
        : '#57606a',
});

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
