import { type ProgrammeOverviewData } from 'src/front-components/types/programme-overview-data';
import { type ProgrammeOverviewSummary } from 'src/front-components/types/programme-overview-summary';

const OPEN_STAGES = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL'];
const TOP_SUPPORTER_COUNT = 5;
const UPCOMING_EVENT_COUNT = 3;

// Gifts are credited to the person who gave, or to the organisation when no person is recorded.
export const summariseProgramme = (data: ProgrammeOverviewData, now: Date): ProgrammeOverviewSummary => {
  const totals = new Map<string, { name: string; totalMicros: number }>();
  for (const gift of data.gifts) {
    const key = gift.donorId ?? gift.companyId;
    const name = gift.donorId ? gift.donorName : gift.companyName;
    if (!key || !name) continue;
    const current = totals.get(key) ?? { name, totalMicros: 0 };
    current.totalMicros += Math.round(gift.amountMicros ?? 0);
    totals.set(key, current);
  }

  const openOpportunities = data.opportunities.filter((opportunity) => OPEN_STAGES.includes(opportunity.stage ?? ''));

  return {
    raisedMicros: data.gifts.reduce((sum, gift) => sum + Math.round(gift.amountMicros ?? 0), 0),
    supporterCount: totals.size,
    pipelineMicros: openOpportunities.reduce((sum, opportunity) => sum + Math.round(opportunity.amountMicros ?? 0), 0),
    openOpportunityCount: openOpportunities.length,
    currentArtists: data.roles
      .filter((role) => role.status === 'CURRENT')
      .map((role) => ({ name: role.personName, role: role.artisticRole, cohort: role.cohort })),
    incomingArtistCount: data.roles.filter((role) => role.status === 'INCOMING').length,
    alumniCount: data.roles.filter((role) => role.status === 'ALUMNI').length,
    topSupporters: [...totals.values()]
      .sort((left, right) => right.totalMicros - left.totalMicros)
      .slice(0, TOP_SUPPORTER_COUNT),
    upcomingEvents: data.events
      .filter((event) => event.startsAt !== null && new Date(event.startsAt) >= now && event.status !== 'CANCELLED')
      .sort((left, right) => (left.startsAt ?? '').localeCompare(right.startsAt ?? ''))
      .slice(0, UPCOMING_EVENT_COUNT)
      .map((event) => ({
        id: event.id,
        name: event.name,
        startsAt: event.startsAt ?? '',
        acceptedCount: event.acceptedCount ?? 0,
        capacity: event.capacity,
      })),
  };
};
