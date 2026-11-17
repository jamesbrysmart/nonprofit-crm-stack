import { type ReactNode, useEffect, useState } from 'react';
import { defineFrontComponent, PageLayoutType } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconCalendarEvent, IconCurrencyEuro, IconMicrophone, IconTargetArrow, IconUsersGroup } from 'twenty-ui/icon';
import { type IconComponent } from 'twenty-ui/icon';
import { Avatar, Tag } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

import { ARTISTIC_ROLE_LABELS } from 'src/front-components/constants/artistic-role-labels';
import { type ProgrammeOverviewSummary } from 'src/front-components/types/programme-overview-summary';
import { formatEuros } from 'src/front-components/utils/format-euros.util';
import { formatEventDate } from 'src/front-components/utils/format-event-date.util';
import { loadProgrammeOverview } from 'src/front-components/utils/load-programme-overview.util';
import { summariseProgramme } from 'src/front-components/utils/summarise-programme.util';

export const PROGRAMME_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER = 'a7f1b3a8-66f2-4d77-9e35-f72a4e4cbd08';
const PROGRAMME_OBJECT_UNIVERSAL_IDENTIFIER = '5d748db1-ad39-4b81-abb4-67a8d73708c3';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: ProgrammeOverviewSummary };

const Stat = ({ icon: Icon, label, value, detail }: { icon: IconComponent; label: string; value: string; detail?: string }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[1],
        padding: theme.spacing[3],
        borderRadius: theme.border.radius.md,
        border: `1px solid ${theme.border.color.light}`,
        background: theme.background.secondary,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[1], color: theme.font.color.tertiary }}>
        <Icon size={14} aria-hidden />
        <Text size="sm" color="tertiary" truncate>
          {label}
        </Text>
      </div>
      <Text size="xl" weight="semibold" truncate>
        {value}
      </Text>
      {detail ? (
        <Text size="sm" color="tertiary" truncate>
          {detail}
        </Text>
      ) : null}
    </div>
  );
};

const ListSection = ({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) => {
  const theme = useTheme();
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], minWidth: 0 }}>
      <Section.Header title={title} level={3} size="sm" />
      {children.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>{children}</div>
      ) : (
        <Text size="sm" color="tertiary">
          {empty}
        </Text>
      )}
    </section>
  );
};

const Row = ({ name, children }: { name: string; children: ReactNode }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], minWidth: 0 }}>
      <Avatar name={name} size="sm" shape="circle" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="md" truncate>
          {name}
        </Text>
      </div>
      {children}
    </div>
  );
};

const ProgrammeOverview = () => {
  const theme = useTheme();
  const recordId = useRecordId();
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!recordId) {
      setState({ status: 'error', message: 'Open a programme to see its overview.' });
      return;
    }
    let isCurrent = true;
    setState({ status: 'loading' });
    loadProgrammeOverview(recordId)
      .then((data) => {
        if (!isCurrent) return;
        setState(
          data
            ? { status: 'ready', summary: summariseProgramme(data, new Date()) }
            : { status: 'error', message: 'This programme could not be found.' },
        );
      })
      .catch((error: unknown) => {
        if (isCurrent) setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      isCurrent = false;
    };
  }, [recordId]);

  if (state.status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: theme.spacing[6] }}>
        <Loader />
      </div>
    );
  }
  if (state.status === 'error') {
    return <Callout status="error" title="Programme overview unavailable" description={state.message} />;
  }

  const { summary } = state;
  const artistDetail = [
    summary.incomingArtistCount ? `${summary.incomingArtistCount} incoming` : null,
    summary.alumniCount ? `${summary.alumniCount} alumni` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4], padding: theme.spacing[1] }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: theme.spacing[2] }}>
        <Stat icon={IconCurrencyEuro} label="Raised to date" value={formatEuros(summary.raisedMicros)} />
        <Stat icon={IconUsersGroup} label="Supporters" value={String(summary.supporterCount)} detail="People and organisations" />
        <Stat
          icon={IconTargetArrow}
          label="Open pipeline"
          value={formatEuros(summary.pipelineMicros)}
          detail={`${summary.openOpportunityCount} ${summary.openOpportunityCount === 1 ? 'opportunity' : 'opportunities'}`}
        />
        <Stat
          icon={IconMicrophone}
          label="Current artists"
          value={String(summary.currentArtists.length)}
          detail={artistDetail || undefined}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: theme.spacing[4] }}>
        <ListSection title="Leading supporters" empty="No gifts to this programme's funds yet.">
          {summary.topSupporters.map((supporter) => (
            <Row key={supporter.name} name={supporter.name}>
              <Text size="md" weight="medium">
                {formatEuros(supporter.totalMicros)}
              </Text>
            </Row>
          ))}
        </ListSection>

        <ListSection title="Current artists" empty="No current artists.">
          {summary.currentArtists.map((artist) => (
            <Row key={`${artist.name}-${artist.role}`} name={artist.name}>
              <Tag color="purple" variant="soft">
                {ARTISTIC_ROLE_LABELS[artist.role ?? ''] ?? artist.role ?? 'Artist'}
              </Tag>
            </Row>
          ))}
        </ListSection>

        <ListSection title="Coming up" empty="No upcoming events.">
          {summary.upcomingEvents.map((event) => (
            <div key={event.id} style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing[2], minWidth: 0 }}>
              <div style={{ color: theme.font.color.tertiary, paddingTop: theme.spacing[1] }}>
                <IconCalendarEvent size={16} aria-hidden />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Text size="md" truncate>
                  {event.name}
                </Text>
                <Text size="sm" color="tertiary" truncate>
                  {formatEventDate(event.startsAt)} · {event.acceptedCount}
                  {event.capacity ? ` of ${event.capacity}` : ''} confirmed
                </Text>
              </div>
            </div>
          ))}
        </ListSection>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: PROGRAMME_OVERVIEW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'programme-overview',
  description: 'A programme at a glance: money raised, supporters, pipeline, current artists and upcoming events.',
  component: ProgrammeOverview,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [PROGRAMME_OBJECT_UNIVERSAL_IDENTIFIER],
  },
});
