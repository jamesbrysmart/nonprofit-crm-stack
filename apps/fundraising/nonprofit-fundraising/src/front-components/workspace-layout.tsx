import type { CSSProperties, ReactNode } from 'react';
import { Text } from 'twenty-ui/primitives/typography';
import { theme } from 'src/front-components/theme-tokens';

const SECTION_STYLE: CSSProperties = {
  display: 'grid',
  gap: 8,
  padding: '12px 0',
  borderTop: `1px solid ${theme.border.color.light}`,
};

const SECTION_HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
};

export const WorkspaceSection = ({
  title,
  headerAction,
  children,
}: {
  title: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) => (
  <section style={SECTION_STYLE}>
    <div style={SECTION_HEADER_STYLE}>
      <Text render={<h3 />} size="sm" weight="semibold" color="secondary">
        {title}
      </Text>
      {headerAction}
    </div>
    {children}
  </section>
);

export const WorkspaceText = ({
  children,
  color = 'secondary',
}: {
  children: ReactNode;
  color?: 'primary' | 'secondary';
}) => (
  <Text render={<div />} size="sm" color={color}>
    {children}
  </Text>
);
