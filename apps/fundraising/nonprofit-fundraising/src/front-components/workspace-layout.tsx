import type { CSSProperties, ReactNode } from 'react';
import { Button } from 'twenty-ui/primitives/input';
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

const QUEUE_ROW_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  alignItems: 'center',
  gap: 8,
};

const QUEUE_COUNT_STYLE: CSSProperties = {
  textAlign: 'right',
  minWidth: 56,
};

const giftCount = (count: number) => `${count} gift${count === 1 ? '' : 's'}`;

export const WorkspaceQueueRow = ({
  label,
  count,
  onOpen,
}: {
  label: string;
  count: number;
  onOpen: () => void;
}) => (
  <div style={QUEUE_ROW_STYLE}>
    <Text render={<span />} size="sm">
      {label}
    </Text>
    <Text render={<span />} size="sm" color="secondary" style={QUEUE_COUNT_STYLE}>
      {giftCount(count)}
    </Text>
    <Button variant="link" size="sm" onClick={onOpen}>
      Open
    </Button>
  </div>
);
