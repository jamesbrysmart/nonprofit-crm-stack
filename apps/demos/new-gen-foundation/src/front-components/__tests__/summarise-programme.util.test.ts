import { describe, expect, it } from 'vitest';

import { type ProgrammeOverviewData } from 'src/front-components/types/programme-overview-data';
import { summariseProgramme } from 'src/front-components/utils/summarise-programme.util';

const euros = (amount: number) => amount * 1_000_000;

const data: ProgrammeOverviewData = {
  programme: { name: 'Mascarade Opera', tagline: null, discipline: 'OPERA', status: 'ACTIVE' },
  roles: [
    { personName: 'Chiara Montanari', artisticRole: 'SOPRANO', status: 'CURRENT', cohort: '2025–27' },
    { personName: 'Giovanni Sarti', artisticRole: 'TENOR', status: 'INCOMING', cohort: '2027–29' },
    { personName: 'Luca Benedetti', artisticRole: 'BARITONE', status: 'ALUMNI', cohort: '2023–25' },
  ],
  events: [
    { id: 'past', name: 'Gala', startsAt: '2026-10-10T18:00:00Z', status: 'COMPLETED', acceptedCount: 70, capacity: 120 },
    { id: 'later', name: 'Reception', startsAt: '2026-12-16T17:00:00Z', status: 'PLANNING', acceptedCount: 0, capacity: 90 },
    { id: 'soon', name: 'Rehearsal', startsAt: '2026-12-05T17:30:00Z', status: 'INVITATIONS_SENT', acceptedCount: 11, capacity: null },
    { id: 'cancelled', name: 'Cancelled', startsAt: '2026-12-01T17:30:00Z', status: 'CANCELLED', acceptedCount: 0, capacity: 10 },
  ],
  opportunities: [
    { amountMicros: euros(60000), stage: 'SCREENING' },
    { amountMicros: euros(24000), stage: 'MEETING' },
    { amountMicros: euros(120000), stage: 'STEWARDSHIP' },
    { amountMicros: euros(20000), stage: 'DECLINED' },
  ],
  gifts: [
    { amountMicros: euros(60000), donorId: null, donorName: null, companyId: 'bardelli', companyName: 'Fondazione Famiglia Bardelli' },
    { amountMicros: euros(30000), donorId: null, donorName: null, companyId: 'bardelli', companyName: 'Fondazione Famiglia Bardelli' },
    { amountMicros: euros(6000), donorId: 'livia', donorName: 'Livia Bardelli', companyId: null, companyName: null },
    { amountMicros: euros(500), donorId: 'marco', donorName: 'Marco Pellegrini', companyId: 'studio', companyName: 'Studio' },
    { amountMicros: euros(100), donorId: null, donorName: null, companyId: null, companyName: null },
  ],
};

describe('summariseProgramme', () => {
  const summary = summariseProgramme(data, new Date('2026-11-17T12:00:00Z'));

  it('totals every gift and counts distinct supporters, crediting the person over the organisation', () => {
    expect(summary.raisedMicros).toBe(euros(96600));
    expect(summary.supporterCount).toBe(3);
    expect(summary.topSupporters.map((supporter) => supporter.name)).toEqual([
      'Fondazione Famiglia Bardelli',
      'Livia Bardelli',
      'Marco Pellegrini',
    ]);
    expect(summary.topSupporters[0].totalMicros).toBe(euros(90000));
  });

  it('counts only open opportunities in the pipeline', () => {
    expect(summary.pipelineMicros).toBe(euros(84000));
    expect(summary.openOpportunityCount).toBe(2);
  });

  it('separates current, incoming and alumni artists', () => {
    expect(summary.currentArtists).toEqual([{ name: 'Chiara Montanari', role: 'SOPRANO', cohort: '2025–27' }]);
    expect(summary.incomingArtistCount).toBe(1);
    expect(summary.alumniCount).toBe(1);
  });

  it('lists future, non-cancelled events soonest first', () => {
    expect(summary.upcomingEvents.map((event) => event.id)).toEqual(['soon', 'later']);
  });
});
