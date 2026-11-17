// Hand-written NGF demo world. Programmes are NGF's real programmes; every
// person, organisation, gift, event and conversation is fictional.

export type Key = string;

export type SeedProgramme = {
  key: Key;
  name: string;
  discipline: 'OPERA' | 'SACRED_MUSIC' | 'BALLET';
  status: 'ACTIVE' | 'LAUNCHING' | 'PAUSED';
  launchYear: number;
  tagline: string;
  description: string;
};

export type SeedOrganisation = {
  key: Key;
  name: string;
  organisationType: string;
  city: string;
  country: string;
  domain?: string;
};

export type SeedPerson = {
  key: Key;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string;
  jobTitle?: string;
  company?: Key;
  constituentTypes: string[];
  preferredLanguage: 'IT' | 'EN' | 'FR' | 'DE';
  newsletterStatus: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'NOT_SUBSCRIBED';
  contactPreferences: string[];
  consentDate?: string;
  consentSource?: string;
  profile?: string;
};

export type SeedFund = {
  key: Key;
  name: string;
  code: string;
  restrictionType: 'UNRESTRICTED' | 'RESTRICTED' | 'DESIGNATED';
  programme?: Key;
  description: string;
};

export type SeedAppeal = {
  key: Key;
  name: string;
  appealType: string;
  status: 'ACTIVE' | 'CLOSED';
  startDate: string;
  endDate: string;
  goalAmount: number;
  defaultFund?: Key;
  description: string;
};

export type SeedOpportunity = {
  key: Key;
  name: string;
  amount: number;
  // Twenty's standard stage values; relabelled as cultivation stages in the workspace.
  stage: 'NEW' | 'SCREENING' | 'MEETING' | 'PROPOSAL' | 'CUSTOMER';
  closeDate: string;
  company?: Key;
  pointOfContact?: Key;
  programme?: Key;
  fundingType: string;
  awardedAmount?: number;
  applicationDeadline?: string;
  submittedDate?: string;
  fundingPeriodStart?: string;
  fundingPeriodEnd?: string;
};

export type SeedRole = {
  person: Key;
  programme: Key;
  role: string;
  status: 'CURRENT' | 'INCOMING' | 'ALUMNI';
  cohort?: string;
  startDate: string;
  endDate?: string;
  scholarship?: Key;
  notes?: string;
};

export type SeedRelationship = {
  person: Key;
  relationshipType: string;
  relatedPerson?: Key;
  relatedOrganisation?: Key;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

export type SeedEvent = {
  key: Key;
  name: string;
  eventType: string;
  status: string;
  startsAt: string;
  city: string;
  venue: Key;
  programme?: Key;
  sponsorship?: Key;
  capacity: number;
  incomeTarget?: number;
  description: string;
};

export type SeedGuest = {
  event: Key;
  person: Key;
  rsvpStatus: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'ATTENDED' | 'NO_SHOW';
  guestRole: string;
  partySize?: number;
  tableName?: string;
  notes?: string;
  followUpDone?: boolean;
};

export type SeedMembership = {
  key: Key;
  person: Key;
  tier: 'FRIEND' | 'UNDER_35' | 'HONORARY';
  status: 'ACTIVE' | 'RENEWAL_DUE' | 'LAPSED' | 'CANCELLED';
  memberSince: string;
  startDate: string;
  endDate: string;
};

export type SeedGift = {
  name: string;
  amount: number;
  giftDate: string;
  giftType: 'DONATION' | 'GRANT' | 'SPONSORSHIP' | 'GIFT_IN_KIND';
  paymentType: 'CARD' | 'DIRECT_DEBIT' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER';
  donor?: Key;
  company?: Key;
  fund: Key;
  appeal?: Key;
  opportunity?: Key;
  event?: Key;
  membership?: Key;
  softCreditPerson?: Key;
  softCreditType?: string;
  givingRoute: 'ITALY_DIRECT' | 'UK_ROUTE' | 'US_CAF_AMERICA' | 'OTHER';
  originalAmount?: { amount: number; currencyCode: 'GBP' | 'USD' };
  description?: string;
};

export type SeedTask = {
  title: string;
  body: string;
  dueAt: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  targets: { people?: Key[]; companies?: Key[]; opportunities?: Key[] };
};

export type SeedNote = {
  title: string;
  body: string;
  targets: { people?: Key[]; companies?: Key[]; opportunities?: Key[] };
};

// ---------------------------------------------------------------- programmes

export const PROGRAMMES: SeedProgramme[] = [
  {
    key: 'mascarade',
    name: 'Mascarade Opera',
    discipline: 'OPERA',
    status: 'ACTIVE',
    launchYear: 2020,
    tagline: 'Training the next generation of opera singers and pianists',
    description:
      'Supports and trains emerging opera singers, pianists and other young musical talent through scholarships, coaching, masterclasses and performance opportunities.',
  },
  {
    key: 'vox',
    name: 'Vox Medicea',
    discipline: 'SACRED_MUSIC',
    status: 'ACTIVE',
    launchYear: 2021,
    tagline: 'Rediscovering the sacred music of Medici Florence',
    description:
      'Research and performance focused on rediscovering historical sacred music associated with the Medici period, from archive to concert.',
  },
  {
    key: 'ballet',
    name: 'Nouveaux Ballets Russes / New Ballet',
    discipline: 'BALLET',
    status: 'LAUNCHING',
    launchYear: 2025,
    tagline: 'A new home for ballet in Florence',
    description:
      'A newer ballet-focused initiative bringing together young dancers and choreographers.',
  },
];

// ---------------------------------------------------------------- organisations

export const ORGANISATIONS: SeedOrganisation[] = [
  { key: 'bardelliFoundation', name: 'Fondazione Famiglia Bardelli', organisationType: 'FAMILY_FOUNDATION', city: 'Firenze', country: 'Italy' },
  { key: 'lanificio', name: 'Lanificio Valdarno', organisationType: 'CORPORATE', city: 'Prato', country: 'Italy', domain: 'lanificio-valdarno.example.org' },
  { key: 'arno', name: 'Fondazione Arno per la Cultura', organisationType: 'BANKING_FOUNDATION', city: 'Firenze', country: 'Italy', domain: 'fondazione-arno.example.org' },
  { key: 'corsellini', name: 'Palazzo Corsellini', organisationType: 'VENUE', city: 'Firenze', country: 'Italy' },
  { key: 'oratorio', name: 'Oratorio di San Benedetto alle Vigne', organisationType: 'VENUE', city: 'Firenze', country: 'Italy' },
  { key: 'spazioDanza', name: 'Spazio Danza Le Cascine', organisationType: 'VENUE', city: 'Firenze', country: 'Italy' },
  { key: 'studioGherardi', name: 'Studio Legale Gherardi', organisationType: 'CORPORATE', city: 'Firenze', country: 'Italy' },
];

// ---------------------------------------------------------------- hero people

const IT = (city = 'Firenze') => ({ city, country: 'Italy', preferredLanguage: 'IT' as const });

export const HERO_PEOPLE: SeedPerson[] = [
  {
    key: 'livia', firstName: 'Livia', lastName: 'Bardelli', email: 'livia.bardelli@example.org', ...IT(),
    jobTitle: 'Trustee, Fondazione Famiglia Bardelli', company: 'bardelliFoundation',
    constituentTypes: ['DONOR', 'PATRON', 'FRIEND'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['PHONE', 'EVENTS', 'POST'], consentDate: '2021-03-12', consentSource: 'PAPER',
    profile:
      'Collector and lifelong opera lover. Friend since 2021 and, with Tommaso, funder of the Bardelli Scholarship in Mascarade Opera. Prefers updates by phone and in person, in Italian.',
  },
  {
    key: 'tommaso', firstName: 'Tommaso', lastName: 'Bardelli', email: 'tommaso.bardelli@example.org', ...IT(),
    jobTitle: 'President, Fondazione Famiglia Bardelli', company: 'bardelliFoundation',
    constituentTypes: ['DONOR', 'PATRON', 'FRIEND'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2021-03-12', consentSource: 'PAPER',
    profile: 'Entrepreneur in the Florentine leather trade. Leads the family foundation; keen interest in young pianists.',
  },
  {
    key: 'chiara', firstName: 'Chiara', lastName: 'Montanari', email: 'chiara.montanari@example.org', ...IT(),
    jobTitle: 'Soprano', constituentTypes: ['ARTIST', 'NEWSLETTER'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2025-05-17', consentSource: 'EVENT',
    profile:
      'Soprano from Naples, born 2000. Bardelli Scholar in Mascarade Opera (2025–27). Lyric repertoire; preparing for international competitions in 2027.',
  },
  {
    key: 'matteo', firstName: 'Matteo', lastName: 'Lorenzini', email: 'matteo.lorenzini@example.org', ...IT(),
    jobTitle: 'Pianist and répétiteur', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL'], consentDate: '2023-09-01', consentSource: 'EMAIL',
    profile: 'Répétiteur for the Mascarade Opera singers since 2023; gives patrons\' masterclass evenings.',
  },
  {
    key: 'alessandro', firstName: 'Alessandro', lastName: 'Vannucci', email: 'a.vannucci@example.org', ...IT(),
    jobTitle: 'Musicologist, research lead for Vox Medicea', constituentTypes: ['ARTIST', 'DONOR'],
    newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2021-10-04', consentSource: 'EMAIL',
    profile: 'Specialist in sixteenth-century Florentine sacred music. Leads the archive research behind Vox Medicea programmes.',
  },
  {
    key: 'eleanor', firstName: 'Eleanor', lastName: 'Whitcombe', email: 'eleanor.whitcombe@example.org',
    city: 'London', country: 'United Kingdom', preferredLanguage: 'EN',
    jobTitle: 'Retired barrister', constituentTypes: ['DONOR', 'FRIEND', 'PROSPECT'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'POST', 'EVENTS'], consentDate: '2025-11-20', consentSource: 'EMAIL',
    profile:
      'London-based early-music enthusiast, introduced by Prof. Vannucci after a lecture in London. Gives through the UK giving route. Potential patron for a Vox Medicea recording.',
  },
  {
    key: 'david', firstName: 'David', lastName: 'Hartley', email: 'david.hartley@example.org',
    city: 'New York', country: 'United States', preferredLanguage: 'EN',
    jobTitle: 'Investor', constituentTypes: ['DONOR', 'PATRON', 'PROSPECT'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2025-04-02', consentSource: 'WEBSITE',
    profile:
      'Founding supporter of New Ballet with his wife Margaret. Gives through CAF America. Spends December in Florence.',
  },
  {
    key: 'margaret', firstName: 'Margaret', lastName: 'Hartley', email: 'margaret.hartley@example.org',
    city: 'New York', country: 'United States', preferredLanguage: 'EN',
    jobTitle: 'Former dancer; board member of a New York dance school', constituentTypes: ['DONOR', 'PATRON'],
    newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2025-04-02', consentSource: 'WEBSITE',
    profile: 'Trained as a dancer; the driving force behind the Hartleys\' interest in New Ballet.',
  },
  {
    key: 'sofia', firstName: 'Sofia', lastName: 'Lenz', email: 'sofia.lenz@example.org', ...IT(),
    jobTitle: 'Choreographer', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL'], consentDate: '2025-02-10', consentSource: 'EMAIL',
    profile: 'Italian-Austrian choreographer leading the first New Ballet creations.',
  },
  {
    key: 'paolo', firstName: 'Paolo', lastName: 'Gherardi', email: 'paolo.gherardi@example.org', ...IT(),
    jobTitle: 'Avvocato; Chair of the Board', company: 'studioGherardi',
    constituentTypes: ['BOARD', 'DONOR', 'FRIEND'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'PHONE', 'EVENTS'], consentDate: '2020-11-02', consentSource: 'PAPER',
    profile: 'Founding board member and chair. Opens doors to Florentine business: introduced Lanificio Valdarno in 2024.',
  },
  {
    key: 'giulia', firstName: 'Giulia', lastName: 'Ferri', email: 'giulia.ferri@example.org', ...IT(),
    jobTitle: 'Architect', constituentTypes: ['DONOR', 'UNDER_35', 'NEWSLETTER', 'PROSPECT'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2024-01-15', consentSource: 'WEBSITE',
    profile: 'Under-35 member since 2024, at three events this year. Strong candidate to upgrade to Friends membership.',
  },
  {
    key: 'marco', firstName: 'Marco', lastName: 'Pellegrini', email: 'marco.pellegrini@example.org', ...IT('Milano'),
    jobTitle: 'Finance director', constituentTypes: ['DONOR', 'PROSPECT'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'PHONE'], consentDate: '2021-06-01', consentSource: 'WEBSITE',
    profile: 'Friend 2021–2023; lapsed after moving to Milan. Came to the 2026 gala as Paolo\'s guest and gave on the night.',
  },
  {
    key: 'elena', firstName: 'Elena', lastName: 'Conti', email: 'elena.conti@example.org', ...IT('Prato'),
    jobTitle: 'Head of Communications, Lanificio Valdarno', company: 'lanificio',
    constituentTypes: ['INSTITUTIONAL_CONTACT', 'FRIEND', 'DONOR'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL', 'EVENTS'], consentDate: '2024-03-08', consentSource: 'EVENT',
    profile: 'Main contact for the Lanificio Valdarno sponsorship, and a Friend in her own right since 2024.',
  },
  {
    key: 'francesca', firstName: 'Francesca', lastName: 'Marchi', email: 'f.marchi@example.org', ...IT(),
    jobTitle: 'Programme Officer, Culture', company: 'arno',
    constituentTypes: ['INSTITUTIONAL_CONTACT'], newsletterStatus: 'SUBSCRIBED',
    contactPreferences: ['EMAIL'], consentDate: '2023-02-14', consentSource: 'EMAIL',
    profile: 'Programme officer for culture grants at Fondazione Arno per la Cultura.',
  },
  // supporting artists, giving each programme a believable roster
  { key: 'luca', firstName: 'Luca', lastName: 'Benedetti', email: 'luca.benedetti@example.org', ...IT('Bologna'), jobTitle: 'Baritone', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Mascarade Opera alumnus (2023–25), now in a young artists\' programme abroad.' },
  { key: 'aiko', firstName: 'Aiko', lastName: 'Morita', email: 'aiko.morita@example.org', ...IT(), jobTitle: 'Pianist', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Collaborative pianist in Mascarade Opera since 2025.' },
  { key: 'giovanni', firstName: 'Giovanni', lastName: 'Sarti', email: 'giovanni.sarti@example.org', ...IT('Lucca'), jobTitle: 'Tenor', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Joins Mascarade Opera in January 2027.' },
  { key: 'beatrice', firstName: 'Beatrice', lastName: 'Orsini', email: 'beatrice.orsini@example.org', ...IT('Siena'), jobTitle: 'Mezzo-soprano', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Mascarade Opera singer (2024–26) and Vox Medicea ensemble member.' },
  { key: 'tommasoR', firstName: 'Tommaso', lastName: 'Ricciardi', email: 'tommaso.ricciardi@example.org', ...IT(), jobTitle: 'Countertenor', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Vox Medicea ensemble singer.' },
  { key: 'anna', firstName: 'Anna', lastName: 'Kovač', email: 'anna.kovac@example.org', ...IT(), jobTitle: 'Dancer', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Founding dancer, New Ballet.' },
  { key: 'leo', firstName: 'Leonardo', lastName: 'Fabbri', email: 'leonardo.fabbri@example.org', ...IT(), jobTitle: 'Dancer', constituentTypes: ['ARTIST'], newsletterStatus: 'SUBSCRIBED', contactPreferences: ['EMAIL'], profile: 'Founding dancer, New Ballet.' },
];

// ---------------------------------------------------------------- funds and appeals

export const FUNDS: SeedFund[] = [
  { key: 'general', name: 'General Fund', code: 'GEN', restrictionType: 'UNRESTRICTED', description: 'Unrestricted income supporting all NGF activity.' },
  { key: 'membershipFund', name: 'Friends and Under-35 Membership', code: 'MEM', restrictionType: 'UNRESTRICTED', description: 'Membership subscriptions.' },
  { key: 'mascaradeScholarships', name: 'Mascarade Opera: Scholarships', code: 'MAS-SCH', restrictionType: 'RESTRICTED', programme: 'mascarade', description: 'Named and general scholarships for Mascarade Opera singers and pianists.' },
  { key: 'mascaradeProductions', name: 'Mascarade Opera: Productions and Training', code: 'MAS-PRD', restrictionType: 'RESTRICTED', programme: 'mascarade', description: 'Coaching, masterclasses and performances.' },
  { key: 'voxResearch', name: 'Vox Medicea: Research and Recording', code: 'VOX-REC', restrictionType: 'RESTRICTED', programme: 'vox', description: 'Archive research, editions, concerts and recordings.' },
  { key: 'balletFounding', name: 'New Ballet: Founding Fund', code: 'NB-FND', restrictionType: 'RESTRICTED', programme: 'ballet', description: 'Founding support for the New Ballet initiative.' },
];

export const APPEALS: SeedAppeal[] = [
  { key: 'annual2025', name: 'Annual Appeal 2025', appealType: 'ANNUAL', status: 'CLOSED', startDate: '2025-01-15', endDate: '2025-12-31', goalAmount: 60000, defaultFund: 'general', description: 'Year-end appeal to individual supporters.' },
  { key: 'annual2026', name: 'Annual Appeal 2026', appealType: 'ANNUAL', status: 'ACTIVE', startDate: '2026-01-15', endDate: '2026-12-31', goalAmount: 75000, defaultFund: 'general', description: 'Year-end appeal to individual supporters.' },
  { key: 'gala2026', name: 'Mascarade Gala Concert 2026', appealType: 'EVENT_FUNDRAISING', status: 'CLOSED', startDate: '2026-09-01', endDate: '2026-10-31', goalAmount: 40000, defaultFund: 'mascaradeScholarships', description: 'Giving around the October 2026 gala concert.' },
  { key: 'membership', name: 'Membership 2021–2026', appealType: 'REGULAR_GIVING', status: 'ACTIVE', startDate: '2021-01-01', endDate: '2026-12-31', goalAmount: 30000, defaultFund: 'membershipFund', description: 'Friends and Under-35 membership subscriptions and renewals.' },
  { key: 'balletCircle', name: 'New Ballet Founding Circle', appealType: 'GENERAL', status: 'ACTIVE', startDate: '2025-03-01', endDate: '2027-06-30', goalAmount: 150000, defaultFund: 'balletFounding', description: 'Founding gifts to launch New Ballet.' },
];

// ---------------------------------------------------------------- opportunities

export const OPPORTUNITIES: SeedOpportunity[] = [
  { key: 'bardelliScholarship', name: 'Bardelli Scholarship 2025–27', amount: 120000, stage: 'CUSTOMER', closeDate: '2025-07-15', company: 'bardelliFoundation', pointOfContact: 'livia', programme: 'mascarade', fundingType: 'MAJOR_GIFT', awardedAmount: 120000, fundingPeriodStart: '2025-09-01', fundingPeriodEnd: '2027-08-31' },
  { key: 'galaSponsorship2026', name: 'Gala Concert Sponsorship 2026', amount: 24000, stage: 'CUSTOMER', closeDate: '2026-06-30', company: 'lanificio', pointOfContact: 'elena', programme: 'mascarade', fundingType: 'CORPORATE_SPONSORSHIP', awardedAmount: 24000 },
  { key: 'galaSponsorship2027', name: 'Gala Concert Sponsorship 2027', amount: 24000, stage: 'MEETING', closeDate: '2027-04-30', company: 'lanificio', pointOfContact: 'elena', programme: 'mascarade', fundingType: 'CORPORATE_SPONSORSHIP' },
  { key: 'arnoRecording', name: 'Vox Medicea recording project', amount: 40000, stage: 'PROPOSAL', closeDate: '2027-04-30', company: 'arno', pointOfContact: 'francesca', programme: 'vox', fundingType: 'TRUST_FOUNDATION', applicationDeadline: '2027-01-31' },
  { key: 'arno2024', name: 'Mascarade Opera training grant 2024', amount: 30000, stage: 'CUSTOMER', closeDate: '2024-05-31', company: 'arno', pointOfContact: 'francesca', programme: 'mascarade', fundingType: 'TRUST_FOUNDATION', awardedAmount: 30000, submittedDate: '2024-01-29', fundingPeriodStart: '2024-06-01', fundingPeriodEnd: '2025-05-31' },
  { key: 'hartleyFounding', name: 'Hartley founding gift to New Ballet', amount: 50000, stage: 'MEETING', closeDate: '2027-03-31', pointOfContact: 'david', programme: 'ballet', fundingType: 'MAJOR_GIFT' },
  { key: 'eleanorRecording', name: 'Whitcombe patronage: Vox Medicea recording', amount: 15000, stage: 'NEW', closeDate: '2027-06-30', pointOfContact: 'eleanor', programme: 'vox', fundingType: 'MAJOR_GIFT' },
  { key: 'marcoRenewal', name: 'Pellegrini: renewed annual support', amount: 5000, stage: 'SCREENING', closeDate: '2027-02-28', pointOfContact: 'marco', programme: 'mascarade', fundingType: 'MAJOR_GIFT' },
  { key: 'lanificio2025', name: 'Spring Recital Sponsorship 2025', amount: 20000, stage: 'CUSTOMER', closeDate: '2025-03-31', company: 'lanificio', pointOfContact: 'elena', programme: 'mascarade', fundingType: 'CORPORATE_SPONSORSHIP', awardedAmount: 20000 },
];

// ---------------------------------------------------------------- programme roles

export const ROLES: SeedRole[] = [
  { person: 'chiara', programme: 'mascarade', role: 'SOPRANO', status: 'CURRENT', cohort: '2025–27', startDate: '2025-09-01', endDate: '2027-08-31', scholarship: 'bardelliScholarship', notes: 'Bardelli Scholar.' },
  { person: 'matteo', programme: 'mascarade', role: 'REPETITEUR', status: 'CURRENT', startDate: '2023-09-01' },
  { person: 'aiko', programme: 'mascarade', role: 'PIANIST', status: 'CURRENT', cohort: '2025–27', startDate: '2025-09-01', endDate: '2027-08-31' },
  { person: 'beatrice', programme: 'mascarade', role: 'MEZZO_SOPRANO', status: 'CURRENT', cohort: '2024–26', startDate: '2024-09-01', endDate: '2026-12-31' },
  { person: 'luca', programme: 'mascarade', role: 'BARITONE', status: 'ALUMNI', cohort: '2023–25', startDate: '2023-09-01', endDate: '2025-07-31' },
  { person: 'giovanni', programme: 'mascarade', role: 'TENOR', status: 'INCOMING', cohort: '2027–29', startDate: '2027-01-15', endDate: '2028-12-31' },
  { person: 'alessandro', programme: 'vox', role: 'RESEARCHER', status: 'CURRENT', startDate: '2021-10-01', notes: 'Research lead.' },
  { person: 'beatrice', programme: 'vox', role: 'ENSEMBLE_SINGER', status: 'CURRENT', startDate: '2025-01-10' },
  { person: 'tommasoR', programme: 'vox', role: 'ENSEMBLE_SINGER', status: 'CURRENT', startDate: '2022-03-01' },
  { person: 'sofia', programme: 'ballet', role: 'CHOREOGRAPHER', status: 'CURRENT', startDate: '2025-02-01' },
  { person: 'anna', programme: 'ballet', role: 'DANCER', status: 'CURRENT', cohort: 'Founding company', startDate: '2025-09-01' },
  { person: 'leo', programme: 'ballet', role: 'DANCER', status: 'CURRENT', cohort: 'Founding company', startDate: '2025-09-01' },
];

// ---------------------------------------------------------------- relationships

export const RELATIONSHIPS: SeedRelationship[] = [
  { person: 'livia', relationshipType: 'SPOUSE_PARTNER', relatedPerson: 'tommaso', startDate: '1998-06-20' },
  { person: 'david', relationshipType: 'SPOUSE_PARTNER', relatedPerson: 'margaret', startDate: '1991-09-14' },
  { person: 'livia', relationshipType: 'PATRON_OF', relatedPerson: 'chiara', startDate: '2025-09-01', notes: 'Bardelli Scholarship.' },
  { person: 'tommaso', relationshipType: 'PATRON_OF', relatedPerson: 'chiara', startDate: '2025-09-01', notes: 'Bardelli Scholarship.' },
  { person: 'livia', relationshipType: 'TRUSTEE_OF', relatedOrganisation: 'bardelliFoundation', startDate: '2012-01-01' },
  { person: 'tommaso', relationshipType: 'TRUSTEE_OF', relatedOrganisation: 'bardelliFoundation', startDate: '2012-01-01', notes: 'President.' },
  { person: 'eleanor', relationshipType: 'INTRODUCED_BY', relatedPerson: 'alessandro', startDate: '2025-11-06', notes: 'Met after Prof. Vannucci\'s lecture on Medici vespers in London.' },
  { person: 'david', relationshipType: 'INTRODUCED_BY', relatedPerson: 'livia', startDate: '2024-09-07', notes: 'Met at the Venice Biennale.' },
  { person: 'elena', relationshipType: 'INTRODUCED_BY', relatedPerson: 'paolo', startDate: '2024-02-20', notes: 'Paolo introduced Lanificio Valdarno as a sponsor.' },
  { person: 'giulia', relationshipType: 'INTRODUCED_BY', relatedPerson: 'chiara', startDate: '2024-01-10', notes: 'University friends; Giulia joined as an Under-35 member.' },
  { person: 'marco', relationshipType: 'INTRODUCED_BY', relatedPerson: 'paolo', startDate: '2021-05-01', notes: 'Came to the 2026 gala as Paolo\'s guest.' },
  { person: 'elena', relationshipType: 'WORKS_AT', relatedOrganisation: 'lanificio', startDate: '2019-04-01' },
  { person: 'elena', relationshipType: 'CONTACT_FOR', relatedOrganisation: 'lanificio', startDate: '2024-02-20' },
  { person: 'francesca', relationshipType: 'WORKS_AT', relatedOrganisation: 'arno', startDate: '2018-09-01' },
  { person: 'francesca', relationshipType: 'CONTACT_FOR', relatedOrganisation: 'arno', startDate: '2023-02-14' },
  { person: 'paolo', relationshipType: 'WORKS_AT', relatedOrganisation: 'studioGherardi', startDate: '2001-01-01', notes: 'Founding partner.' },
  { person: 'matteo', relationshipType: 'COLLEAGUE', relatedPerson: 'chiara', startDate: '2025-09-01', notes: 'Chiara\'s répétiteur.' },
  { person: 'sofia', relationshipType: 'MENTOR_OF', relatedPerson: 'anna', startDate: '2025-09-01' },
  { person: 'sofia', relationshipType: 'MENTOR_OF', relatedPerson: 'leo', startDate: '2025-09-01' },
  { person: 'margaret', relationshipType: 'PATRON_OF', relatedPerson: 'sofia', startDate: '2025-04-02', notes: 'Founding supporter of New Ballet.' },
];

// ---------------------------------------------------------------- events

export const EVENTS: SeedEvent[] = [
  {
    key: 'spring2025', name: 'Mascarade Opera Spring Recital 2025', eventType: 'PERFORMANCE', status: 'COMPLETED',
    startsAt: '2025-05-17T19:00:00+02:00', city: 'Firenze', venue: 'corsellini', programme: 'mascarade', capacity: 80,
    description: 'Recital by Mascarade Opera singers. The Bardellis first heard Chiara Montanari here.',
  },
  {
    key: 'vespers2026', name: 'Vox Medicea: Vespers for the Medici', eventType: 'PERFORMANCE', status: 'COMPLETED',
    startsAt: '2026-06-14T19:30:00+02:00', city: 'Firenze', venue: 'oratorio', programme: 'vox', capacity: 80, incomeTarget: 8000,
    description: 'Concert reconstruction of vespers music from Medici-era sources, introduced by Prof. Alessandro Vannucci.',
  },
  {
    key: 'gala2026', name: 'Mascarade Opera Gala Concert 2026', eventType: 'GALA', status: 'COMPLETED',
    startsAt: '2026-10-10T20:00:00+02:00', city: 'Firenze', venue: 'corsellini', programme: 'mascarade', sponsorship: 'galaSponsorship2026',
    capacity: 120, incomeTarget: 40000,
    description: 'Annual gala concert and dinner for Mascarade Opera, sponsored by Lanificio Valdarno.',
  },
  {
    key: 'rehearsal2026', name: 'New Ballet: Patrons\' Open Rehearsal', eventType: 'OPEN_REHEARSAL', status: 'INVITATIONS_SENT',
    startsAt: '2026-12-05T18:30:00+01:00', city: 'Firenze', venue: 'spazioDanza', programme: 'ballet', capacity: 40,
    description: 'An evening in the studio with Sofia Lenz and the founding dancers, followed by a light supper.',
  },
  {
    key: 'christmas2026', name: 'Friends\' Christmas Reception 2026', eventType: 'RECEPTION', status: 'PLANNING',
    startsAt: '2026-12-16T18:00:00+01:00', city: 'Firenze', venue: 'corsellini', capacity: 90,
    description: 'Thank-you reception for Friends and Under-35 members, with a short Mascarade Opera performance.',
  },
];

export const HERO_GUESTS: SeedGuest[] = [
  // Spring recital 2025
  { event: 'spring2025', person: 'livia', rsvpStatus: 'ATTENDED', guestRole: 'GUEST', partySize: 2, notes: 'Asked to meet the young soprano after the recital.', followUpDone: true },
  { event: 'spring2025', person: 'tommaso', rsvpStatus: 'ATTENDED', guestRole: 'GUEST', followUpDone: true },
  { event: 'spring2025', person: 'chiara', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'spring2025', person: 'matteo', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'spring2025', person: 'paolo', rsvpStatus: 'ATTENDED', guestRole: 'HOST' },
  { event: 'spring2025', person: 'elena', rsvpStatus: 'ATTENDED', guestRole: 'SPONSOR' },
  // Vespers 2026
  { event: 'vespers2026', person: 'eleanor', rsvpStatus: 'ATTENDED', guestRole: 'PROSPECT', notes: 'Travelled from London. Asked about a recording.', followUpDone: true },
  { event: 'vespers2026', person: 'alessandro', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER', notes: 'Gave the pre-concert introduction.' },
  { event: 'vespers2026', person: 'beatrice', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'vespers2026', person: 'tommasoR', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'vespers2026', person: 'livia', rsvpStatus: 'ATTENDED', guestRole: 'GUEST' },
  { event: 'vespers2026', person: 'paolo', rsvpStatus: 'ATTENDED', guestRole: 'HOST' },
  { event: 'vespers2026', person: 'francesca', rsvpStatus: 'ATTENDED', guestRole: 'GUEST', notes: 'Invited ahead of the recording application.' },
  // Gala 2026
  { event: 'gala2026', person: 'livia', rsvpStatus: 'ATTENDED', guestRole: 'HOST', partySize: 2, tableName: 'Table 1 (Bardelli)', followUpDone: true },
  { event: 'gala2026', person: 'tommaso', rsvpStatus: 'ATTENDED', guestRole: 'HOST', tableName: 'Table 1 (Bardelli)', followUpDone: true },
  { event: 'gala2026', person: 'paolo', rsvpStatus: 'ATTENDED', guestRole: 'HOST', partySize: 2, tableName: 'Table 2 (Board)', followUpDone: true },
  { event: 'gala2026', person: 'elena', rsvpStatus: 'ATTENDED', guestRole: 'SPONSOR', partySize: 4, tableName: 'Table 3 (Lanificio Valdarno)', followUpDone: false },
  { event: 'gala2026', person: 'chiara', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER', notes: 'Sang Mimì\'s aria; seated at Table 1 for dinner.' },
  { event: 'gala2026', person: 'matteo', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'gala2026', person: 'aiko', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'gala2026', person: 'beatrice', rsvpStatus: 'ATTENDED', guestRole: 'PERFORMER' },
  { event: 'gala2026', person: 'marco', rsvpStatus: 'ATTENDED', guestRole: 'PROSPECT', tableName: 'Table 2 (Board)', notes: 'Paolo\'s guest. Gave €500 on the night.', followUpDone: false },
  { event: 'gala2026', person: 'giulia', rsvpStatus: 'ATTENDED', guestRole: 'GUEST', tableName: 'Table 8', notes: 'Vegetarian.', followUpDone: false },
  { event: 'gala2026', person: 'eleanor', rsvpStatus: 'DECLINED', guestRole: 'GUEST', notes: 'Sent apologies from London.' },
  { event: 'gala2026', person: 'david', rsvpStatus: 'DECLINED', guestRole: 'GUEST' },
  { event: 'gala2026', person: 'margaret', rsvpStatus: 'DECLINED', guestRole: 'GUEST' },
  // Open rehearsal (upcoming)
  { event: 'rehearsal2026', person: 'david', rsvpStatus: 'ACCEPTED', guestRole: 'PROSPECT', partySize: 2, notes: 'In Florence 4–7 December. Supper seating next to Sofia Lenz.' },
  { event: 'rehearsal2026', person: 'margaret', rsvpStatus: 'ACCEPTED', guestRole: 'PROSPECT' },
  { event: 'rehearsal2026', person: 'sofia', rsvpStatus: 'ACCEPTED', guestRole: 'PERFORMER' },
  { event: 'rehearsal2026', person: 'anna', rsvpStatus: 'ACCEPTED', guestRole: 'PERFORMER' },
  { event: 'rehearsal2026', person: 'leo', rsvpStatus: 'ACCEPTED', guestRole: 'PERFORMER' },
  { event: 'rehearsal2026', person: 'livia', rsvpStatus: 'ACCEPTED', guestRole: 'HOST', partySize: 2 },
  { event: 'rehearsal2026', person: 'tommaso', rsvpStatus: 'INVITED', guestRole: 'GUEST' },
  { event: 'rehearsal2026', person: 'paolo', rsvpStatus: 'ACCEPTED', guestRole: 'HOST' },
  { event: 'rehearsal2026', person: 'giulia', rsvpStatus: 'INVITED', guestRole: 'GUEST' },
  { event: 'rehearsal2026', person: 'eleanor', rsvpStatus: 'INVITED', guestRole: 'GUEST' },
  { event: 'rehearsal2026', person: 'marco', rsvpStatus: 'INVITED', guestRole: 'PROSPECT' },
];

// ---------------------------------------------------------------- memberships

export const HERO_MEMBERSHIPS: SeedMembership[] = [
  { key: 'm-livia', person: 'livia', tier: 'FRIEND', status: 'ACTIVE', memberSince: '2021-03-12', startDate: '2026-03-12', endDate: '2027-03-11' },
  { key: 'm-tommaso', person: 'tommaso', tier: 'FRIEND', status: 'ACTIVE', memberSince: '2021-03-12', startDate: '2026-03-12', endDate: '2027-03-11' },
  { key: 'm-paolo', person: 'paolo', tier: 'FRIEND', status: 'ACTIVE', memberSince: '2020-11-02', startDate: '2026-01-01', endDate: '2026-12-31' },
  { key: 'm-elena', person: 'elena', tier: 'FRIEND', status: 'ACTIVE', memberSince: '2024-03-08', startDate: '2026-03-08', endDate: '2027-03-07' },
  { key: 'm-eleanor', person: 'eleanor', tier: 'FRIEND', status: 'ACTIVE', memberSince: '2026-06-20', startDate: '2026-06-20', endDate: '2027-06-19' },
  { key: 'm-giulia', person: 'giulia', tier: 'UNDER_35', status: 'RENEWAL_DUE', memberSince: '2024-01-15', startDate: '2026-01-15', endDate: '2027-01-14' },
  { key: 'm-chiara', person: 'chiara', tier: 'HONORARY', status: 'ACTIVE', memberSince: '2025-09-01', startDate: '2025-09-01', endDate: '2027-08-31' },
  { key: 'm-marco', person: 'marco', tier: 'FRIEND', status: 'LAPSED', memberSince: '2021-06-01', startDate: '2023-06-01', endDate: '2024-05-31' },
];

// ---------------------------------------------------------------- hero gifts

export const HERO_GIFTS: SeedGift[] = [
  // Bardelli Scholarship payments, via the family foundation, soft-credited to Livia
  { name: 'Bardelli Scholarship: first instalment', amount: 60000, giftDate: '2025-09-15', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', company: 'bardelliFoundation', fund: 'mascaradeScholarships', opportunity: 'bardelliScholarship', softCreditPerson: 'livia', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Bardelli Scholarship: second instalment', amount: 30000, giftDate: '2026-03-16', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', company: 'bardelliFoundation', fund: 'mascaradeScholarships', opportunity: 'bardelliScholarship', softCreditPerson: 'livia', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  // Bardelli personal giving
  { name: 'Annual gift 2021', amount: 2500, giftDate: '2021-12-10', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'tommaso', fund: 'general', softCreditPerson: 'livia', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2022', amount: 3000, giftDate: '2022-12-12', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'tommaso', fund: 'general', softCreditPerson: 'livia', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2023', amount: 5000, giftDate: '2023-12-11', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'tommaso', fund: 'mascaradeProductions', softCreditPerson: 'livia', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2024', amount: 5000, giftDate: '2024-12-09', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'livia', fund: 'mascaradeProductions', softCreditPerson: 'tommaso', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Gala table 2026', amount: 6000, giftDate: '2026-10-10', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'livia', fund: 'mascaradeScholarships', appeal: 'gala2026', event: 'gala2026', softCreditPerson: 'tommaso', softCreditType: 'PARTNER', givingRoute: 'ITALY_DIRECT' },
  // Lanificio Valdarno sponsorships, introduced by Paolo
  { name: 'Spring Recital sponsorship 2025', amount: 20000, giftDate: '2025-04-30', giftType: 'SPONSORSHIP', paymentType: 'BANK_TRANSFER', company: 'lanificio', fund: 'mascaradeProductions', opportunity: 'lanificio2025', softCreditPerson: 'paolo', softCreditType: 'INTRODUCER', givingRoute: 'ITALY_DIRECT' },
  { name: 'Gala Concert sponsorship 2026', amount: 24000, giftDate: '2026-09-15', giftType: 'SPONSORSHIP', paymentType: 'BANK_TRANSFER', company: 'lanificio', fund: 'mascaradeProductions', appeal: 'gala2026', opportunity: 'galaSponsorship2026', event: 'gala2026', softCreditPerson: 'paolo', softCreditType: 'INTRODUCER', givingRoute: 'ITALY_DIRECT' },
  // Fondazione Arno grant
  { name: 'Mascarade Opera training grant 2024', amount: 30000, giftDate: '2024-07-05', giftType: 'GRANT', paymentType: 'BANK_TRANSFER', company: 'arno', fund: 'mascaradeProductions', opportunity: 'arno2024', givingRoute: 'ITALY_DIRECT' },
  // Hartleys via CAF America
  { name: 'New Ballet founding gift', amount: 23050, giftDate: '2025-06-18', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'david', fund: 'balletFounding', appeal: 'balletCircle', softCreditPerson: 'margaret', softCreditType: 'PARTNER', givingRoute: 'US_CAF_AMERICA', originalAmount: { amount: 25000, currencyCode: 'USD' } },
  { name: 'New Ballet: dancers\' season support', amount: 8600, giftDate: '2026-04-22', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'margaret', fund: 'balletFounding', appeal: 'balletCircle', softCreditPerson: 'david', softCreditType: 'PARTNER', givingRoute: 'US_CAF_AMERICA', originalAmount: { amount: 10000, currencyCode: 'USD' } },
  // Eleanor via the UK route
  { name: 'First gift after London introduction', amount: 2340, giftDate: '2025-12-12', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'eleanor', fund: 'voxResearch', appeal: 'annual2025', givingRoute: 'UK_ROUTE', originalAmount: { amount: 2000, currencyCode: 'GBP' } },
  { name: 'Gift after Vespers concert', amount: 5850, giftDate: '2026-06-25', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'eleanor', fund: 'voxResearch', event: 'vespers2026', givingRoute: 'UK_ROUTE', originalAmount: { amount: 5000, currencyCode: 'GBP' } },
  // Paolo
  { name: 'Annual gift 2022', amount: 2500, giftDate: '2022-12-05', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'paolo', fund: 'general', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2023', amount: 2500, giftDate: '2023-12-04', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'paolo', fund: 'general', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2024', amount: 3000, giftDate: '2024-12-02', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'paolo', fund: 'general', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2025', amount: 3000, giftDate: '2025-12-01', giftType: 'DONATION', paymentType: 'BANK_TRANSFER', donor: 'paolo', fund: 'general', appeal: 'annual2025', givingRoute: 'ITALY_DIRECT' },
  // Alessandro
  { name: 'Gift to Vox Medicea editions', amount: 500, giftDate: '2024-11-20', giftType: 'DONATION', paymentType: 'CARD', donor: 'alessandro', fund: 'voxResearch', givingRoute: 'ITALY_DIRECT' },
  // Marco: lapsed, then re-engaged at the gala
  { name: 'Annual gift 2021', amount: 1000, giftDate: '2021-11-30', giftType: 'DONATION', paymentType: 'CARD', donor: 'marco', fund: 'general', givingRoute: 'ITALY_DIRECT' },
  { name: 'Annual gift 2022', amount: 1000, giftDate: '2022-11-28', giftType: 'DONATION', paymentType: 'CARD', donor: 'marco', fund: 'general', givingRoute: 'ITALY_DIRECT' },
  { name: 'Gift on the night', amount: 500, giftDate: '2026-10-10', giftType: 'DONATION', paymentType: 'CARD', donor: 'marco', fund: 'mascaradeScholarships', appeal: 'gala2026', event: 'gala2026', givingRoute: 'ITALY_DIRECT' },
  // Giulia
  { name: 'Gift on the night', amount: 100, giftDate: '2026-10-10', giftType: 'DONATION', paymentType: 'CARD', donor: 'giulia', fund: 'mascaradeScholarships', appeal: 'gala2026', event: 'gala2026', givingRoute: 'ITALY_DIRECT' },
];

// membership payment gifts are derived from memberships by the runner

// ---------------------------------------------------------------- tasks and notes

export const TASKS: SeedTask[] = [
  { title: 'Thank Marco for his gala gift and discuss renewing support', body: 'He lapsed after moving to Milan. Paolo thinks he would rejoin as a Friend; suggest lunch next time he is in Florence.', dueAt: '2026-11-20T10:00:00+01:00', status: 'TODO', targets: { people: ['marco'], opportunities: ['marcoRenewal'] } },
  { title: 'Send Bardelli Scholarship progress report', body: 'Autumn term report on Chiara: coaching, gala performance, competition plans. Include a photo from the gala.', dueAt: '2026-11-28T10:00:00+01:00', status: 'IN_PROGRESS', targets: { people: ['livia', 'tommaso', 'chiara'], companies: ['bardelliFoundation'], opportunities: ['bardelliScholarship'] } },
  { title: 'Confirm supper seating for the Hartleys at the open rehearsal', body: 'Seat David and Margaret with Sofia Lenz. Prepare a one-page New Ballet founding gift proposal for after the visit.', dueAt: '2026-11-25T10:00:00+01:00', status: 'TODO', targets: { people: ['david', 'margaret', 'sofia'], opportunities: ['hartleyFounding'] } },
  { title: 'Finalise Fondazione Arno application budget', body: 'Recording plan, edition costs and match funding. Deadline 31 January 2027.', dueAt: '2027-01-15T10:00:00+01:00', status: 'TODO', targets: { people: ['francesca', 'alessandro'], companies: ['arno'], opportunities: ['arnoRecording'] } },
  { title: 'Invite Giulia to upgrade to Friends membership', body: 'Under-35 renewal due in January. She has attended three events this year.', dueAt: '2026-12-10T10:00:00+01:00', status: 'TODO', targets: { people: ['giulia'] } },
  { title: 'Send Eleanor the Vox Medicea recording outline', body: 'Share Prof. Vannucci\'s outline and the recording timeline; ask about a visit in spring.', dueAt: '2026-12-01T10:00:00+01:00', status: 'TODO', targets: { people: ['eleanor', 'alessandro'], opportunities: ['eleanorRecording'] } },
  { title: 'Share gala impact report with Lanificio Valdarno and propose 2027', body: 'Guest numbers, press coverage, photos of the Lanificio table. Propose renewal at the same level.', dueAt: '2026-11-30T10:00:00+01:00', status: 'TODO', targets: { people: ['elena'], companies: ['lanificio'], opportunities: ['galaSponsorship2027'] } },
  { title: 'Thank-you letter to Lanificio Valdarno for gala sponsorship', body: 'Signed by Paolo Gherardi.', dueAt: '2026-10-15T10:00:00+02:00', status: 'DONE', targets: { people: ['elena'], companies: ['lanificio'] } },
];

export const NOTES: SeedNote[] = [
  { title: 'Lunch with Livia and Tommaso, 3 November 2026', body: 'Delighted with Chiara\'s progress and her gala performance. Livia asked whether the scholarship could include a pianist place from 2027. Tommaso keen to meet Aiko Morita. Prefer updates by phone, in Italian. Next: progress report by end of November.', targets: { people: ['livia', 'tommaso'], opportunities: ['bardelliScholarship'] } },
  { title: 'Video call with David Hartley', body: 'Strong interest in becoming founding supporters of New Ballet. Margaret is the driving force (former dancer). They give through CAF America. In Florence 4–7 December; will attend the open rehearsal. Indicated a gift in the region of $50–60k if the first season plan is convincing.', targets: { people: ['david', 'margaret'], opportunities: ['hartleyFounding'] } },
  { title: 'Eleanor at the Vespers concert', body: 'Very moved by the reconstructed vespers. Asked whether there would be a recording; would consider supporting it. Introduced by Prof. Vannucci. Prefers email; visits Florence twice a year.', targets: { people: ['eleanor', 'alessandro'], opportunities: ['eleanorRecording'] } },
  { title: 'Marco re-engaged at the gala', body: 'Lapsed in 2023 after moving to Milan. Came as Paolo\'s guest and gave €500 on the night. Enjoyed meeting the singers. Open to rejoining as a Friend.', targets: { people: ['marco', 'paolo'] } },
  { title: 'Pre-application call with Francesca Marchi', body: 'Fondazione Arno culture round closes 31 January. Heritage music is a priority this year; typical grants €20–50k. She suggested including a public education element.', targets: { people: ['francesca'], companies: ['arno'], opportunities: ['arnoRecording'] } },
  { title: 'Scholar check-in, autumn term', body: 'Working on Mimì and Contessa with Matteo. Entering two international competitions in 2027. Very grateful to the Bardellis; happy to write them a note.', targets: { people: ['chiara', 'matteo'] } },
];
