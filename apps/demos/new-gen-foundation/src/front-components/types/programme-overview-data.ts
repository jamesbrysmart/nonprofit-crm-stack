// What the Programme overview panel loads for one programme.
export type ProgrammeOverviewData = {
  programme: {
    name: string;
    tagline: string | null;
    discipline: string | null;
    status: string | null;
  };
  roles: Array<{
    personName: string;
    artisticRole: string | null;
    status: string | null;
    cohort: string | null;
  }>;
  events: Array<{
    id: string;
    name: string;
    startsAt: string | null;
    status: string | null;
    acceptedCount: number | null;
    capacity: number | null;
  }>;
  opportunities: Array<{
    amountMicros: number | null;
    stage: string | null;
  }>;
  gifts: Array<{
    amountMicros: number | null;
    donorId: string | null;
    donorName: string | null;
    companyId: string | null;
    companyName: string | null;
  }>;
};
