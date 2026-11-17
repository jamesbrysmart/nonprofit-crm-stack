// The figures and lists the Programme overview panel displays.
export type ProgrammeOverviewSummary = {
  raisedMicros: number;
  supporterCount: number;
  pipelineMicros: number;
  openOpportunityCount: number;
  currentArtists: Array<{ name: string; role: string | null; cohort: string | null }>;
  incomingArtistCount: number;
  alumniCount: number;
  topSupporters: Array<{ name: string; totalMicros: number }>;
  upcomingEvents: Array<{
    id: string;
    name: string;
    startsAt: string;
    acceptedCount: number;
    capacity: number | null;
  }>;
};
