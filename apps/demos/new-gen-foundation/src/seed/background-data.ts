// Deterministic supporting records so lists, charts and guest lists look
// lived-in around the hero records. All names and organisations are fictional.
import {
  HERO_MEMBERSHIPS,
  type SeedGift,
  type SeedGuest,
  type SeedMembership,
  type SeedOrganisation,
  type SeedPerson,
} from 'src/seed/hero-data';

const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const random = createRandom(20261117);
const pick = <TItem>(items: readonly TItem[]): TItem => items[Math.floor(random() * items.length)];
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pad = (value: number) => String(value).padStart(2, '0');
const dateIn = (year: number, fromMonth = 1, toMonth = 12) =>
  `${year}-${pad(between(fromMonth, toMonth))}-${pad(between(1, 28))}`;

const ITALIAN_FIRST = ['Alessia', 'Andrea', 'Benedetta', 'Carlo', 'Cristina', 'Daniele', 'Elisa', 'Emanuele', 'Federica', 'Filippo', 'Gabriele', 'Ilaria', 'Jacopo', 'Laura', 'Lorenzo', 'Lucia', 'Margherita', 'Martina', 'Niccolò', 'Paola', 'Pietro', 'Roberta', 'Riccardo', 'Silvia', 'Simone', 'Stefania', 'Valentina', 'Vittoria', 'Edoardo', 'Caterina', 'Ludovica', 'Ottavio'];
const ITALIAN_LAST = ['Albertelli', 'Bandini', 'Baroncelli', 'Bigazzi', 'Brunacci', 'Cammelli', 'Cecchini', 'Cerbai', 'Donnini', 'Falciani', 'Gori', 'Gualtieri', 'Innocenti', 'Lisei', 'Lotti', 'Maffei', 'Martelli', 'Morandini', 'Nesti', 'Paoletti', 'Pieraccini', 'Rossetti', 'Salvadori', 'Sernesi', 'Tarchiani', 'Tozzi', 'Vezzosi', 'Zanobini'];
const INTERNATIONAL = [
  { first: 'Charlotte', last: 'Pemberton', city: 'London', country: 'United Kingdom', language: 'EN' as const },
  { first: 'Henry', last: 'Ashworth', city: 'Oxford', country: 'United Kingdom', language: 'EN' as const },
  { first: 'Olivia', last: 'Granger', city: 'Edinburgh', country: 'United Kingdom', language: 'EN' as const },
  { first: 'Robert', last: 'Kessler', city: 'Boston', country: 'United States', language: 'EN' as const },
  { first: 'Susan', last: 'Whitfield', city: 'New York', country: 'United States', language: 'EN' as const },
  { first: 'Claire', last: 'Dumont', city: 'Paris', country: 'France', language: 'FR' as const },
  { first: 'Matthias', last: 'Brenner', city: 'Munich', country: 'Germany', language: 'DE' as const },
  { first: 'Isabelle', last: 'Fournier', city: 'Lyon', country: 'France', language: 'FR' as const },
];
const ITALIAN_CITIES = ['Firenze', 'Firenze', 'Firenze', 'Firenze', 'Fiesole', 'Prato', 'Siena', 'Pistoia', 'Lucca', 'Bologna', 'Milano', 'Roma'];

const BACKGROUND_ORGANISATION_NAMES: Array<[string, string, string]> = [
  ['Fondazione Gualtieri per la Musica', 'FAMILY_FOUNDATION', 'Firenze'],
  ['Fondazione Tarchiani', 'FAMILY_FOUNDATION', 'Siena'],
  ['Fondazione Colline Toscane', 'BANKING_FOUNDATION', 'Pistoia'],
  ['Associazione Amici del Canto', 'CULTURAL_INSTITUTION', 'Firenze'],
  ['Accademia Musicale Oltrarno', 'CULTURAL_INSTITUTION', 'Firenze'],
  ['Conservatorio Privato San Gallo', 'CULTURAL_INSTITUTION', 'Firenze'],
  ['Teatro Comunale di Valdelsa', 'VENUE', 'Poggibonsi'],
  ['Officine Morandini', 'CORPORATE', 'Prato'],
  ['Cantine Lisei', 'CORPORATE', 'Greve in Chianti'],
  ['Studio Architetti Cerbai', 'CORPORATE', 'Firenze'],
  ['Hotel Lungarno Vezzosi', 'CORPORATE', 'Firenze'],
  ['Banca Fiorentina di Credito', 'CORPORATE', 'Firenze'],
  ['Pelletteria Donnini', 'CORPORATE', 'Scandicci'],
  ['Rivista Opera Oggi', 'MEDIA', 'Milano'],
  ['Radio Classica Toscana', 'MEDIA', 'Firenze'],
  ['Comune di Fiesole, Ufficio Cultura', 'PUBLIC_BODY', 'Fiesole'],
  ['Ashworth Charitable Trust', 'TRUST', 'Oxford'],
  ['Kessler Family Foundation', 'FAMILY_FOUNDATION', 'Boston'],
];

export const BACKGROUND_ORGANISATIONS: SeedOrganisation[] = BACKGROUND_ORGANISATION_NAMES.map(
  ([name, organisationType, city], index) => ({
    key: `org-${index}`,
    name,
    organisationType,
    city,
    country: ['Oxford'].includes(city) ? 'United Kingdom' : ['Boston'].includes(city) ? 'United States' : 'Italy',
  }),
);

type Segment = 'FRIEND' | 'UNDER_35' | 'NEWSLETTER' | 'INSTITUTIONAL' | 'DONOR';
const SEGMENTS: Array<[Segment, number]> = [
  ['FRIEND', 22],
  ['UNDER_35', 16],
  ['DONOR', 14],
  ['INSTITUTIONAL', 14],
  ['NEWSLETTER', 34],
];

export type BackgroundPerson = SeedPerson & { segment: Segment };

const usedNames = new Set<string>();
const uniqueItalianName = () => {
  for (;;) {
    const first = pick(ITALIAN_FIRST);
    const last = pick(ITALIAN_LAST);
    if (!usedNames.has(`${first} ${last}`)) {
      usedNames.add(`${first} ${last}`);
      return { first, last };
    }
  }
};

const slug = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '.');

let internationalIndex = 0;
export const BACKGROUND_PEOPLE: BackgroundPerson[] = SEGMENTS.flatMap(([segment, count]) =>
  Array.from({ length: count }, (_, index): BackgroundPerson => {
    const international =
      (segment === 'FRIEND' || segment === 'DONOR') && internationalIndex < INTERNATIONAL.length && random() < 0.3
        ? INTERNATIONAL[internationalIndex++]
        : undefined;
    const { first, last } = international ?? uniqueItalianName();
    const organisation = segment === 'INSTITUTIONAL' ? BACKGROUND_ORGANISATIONS[index % BACKGROUND_ORGANISATIONS.length] : undefined;
    const constituentTypes: Record<Segment, string[]> = {
      FRIEND: ['FRIEND', 'DONOR'],
      UNDER_35: ['UNDER_35', 'NEWSLETTER'],
      DONOR: ['DONOR'],
      INSTITUTIONAL: ['INSTITUTIONAL_CONTACT'],
      NEWSLETTER: ['NEWSLETTER'],
    };
    const subscribed = segment !== 'INSTITUTIONAL' || random() < 0.5;
    return {
      key: `bg-${segment.toLowerCase()}-${index}`,
      segment,
      firstName: first,
      lastName: last,
      email: `${slug(first)}.${slug(last)}@example.org`,
      city: international?.city ?? organisation?.city ?? pick(ITALIAN_CITIES),
      country: international?.country ?? organisation?.country ?? 'Italy',
      preferredLanguage: international?.language ?? 'IT',
      jobTitle: organisation ? pick(['Director', 'Programme Officer', 'Head of Partnerships', 'Marketing Manager', 'Trustee']) : undefined,
      company: organisation?.key,
      constituentTypes: segment === 'UNDER_35' && random() < 0.2 ? [...constituentTypes[segment], 'DONOR'] : constituentTypes[segment],
      newsletterStatus: subscribed ? 'SUBSCRIBED' : 'NOT_SUBSCRIBED',
      contactPreferences: segment === 'NEWSLETTER' ? ['EMAIL'] : pick([['EMAIL', 'EVENTS'], ['EMAIL'], ['EMAIL', 'POST', 'EVENTS']]),
      consentDate: subscribed ? dateIn(between(2021, 2026)) : undefined,
      consentSource: subscribed ? pick(['WEBSITE', 'WEBSITE', 'EVENT', 'PAPER', 'EMAIL']) : undefined,
    };
  }),
);

// ---------------------------------------------------------------- memberships

const TODAY = '2026-11-17';
const addYears = (date: string, years: number) => `${Number(date.slice(0, 4)) + years}${date.slice(4)}`;
const dayBefore = (date: string) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
};

export const BACKGROUND_MEMBERSHIPS: SeedMembership[] = BACKGROUND_PEOPLE.filter(
  (person) => person.segment === 'FRIEND' || person.segment === 'UNDER_35',
).map((person) => {
  const memberSince = dateIn(between(person.segment === 'FRIEND' ? 2021 : 2023, 2026));
  let startDate = memberSince;
  while (addYears(startDate, 1) <= TODAY) startDate = addYears(startDate, 1);
  const endDate = dayBefore(addYears(startDate, 1));
  // A lapsed member stopped renewing after their previous period.
  const lapsed = startDate > memberSince && random() < 0.15;
  const renewalDue = !lapsed && endDate <= '2027-01-16';
  return {
    key: `m-${person.key}`,
    person: person.key,
    tier: person.segment === 'FRIEND' ? 'FRIEND' : 'UNDER_35',
    status: lapsed ? 'LAPSED' : renewalDue ? 'RENEWAL_DUE' : 'ACTIVE',
    memberSince,
    startDate: lapsed ? addYears(startDate, -1) : startDate,
    endDate: lapsed ? dayBefore(startDate) : endDate,
  };
});

// One payment per membership year up to the current period (none for honorary or after lapsing).
export const membershipGifts = (memberships: SeedMembership[]): SeedGift[] =>
  memberships.flatMap((membership) => {
    if (membership.tier === 'HONORARY') return [];
    const fee = membership.tier === 'FRIEND' ? 1000 : 200;
    const gifts: SeedGift[] = [];
    for (let date = membership.memberSince; date <= membership.startDate && date <= TODAY; date = addYears(date, 1)) {
      gifts.push({
        name: `${membership.tier === 'FRIEND' ? 'Friends' : 'Under-35'} membership ${date.slice(0, 4)}`,
        amount: fee,
        giftDate: date,
        giftType: 'DONATION',
        paymentType: pick(['CARD', 'CARD', 'BANK_TRANSFER', 'DIRECT_DEBIT']),
        donor: membership.person,
        fund: 'membershipFund',
        appeal: 'membership',
        membership: membership.key,
        givingRoute: 'ITALY_DIRECT',
      });
    }
    return gifts;
  });

export const ALL_MEMBERSHIPS = [...HERO_MEMBERSHIPS, ...BACKGROUND_MEMBERSHIPS];

// ---------------------------------------------------------------- background gifts

const ANNUAL_FUNDS = ['general', 'general', 'mascaradeScholarships', 'mascaradeProductions', 'voxResearch'];
const growth = (year: number) => 1 + (year - 2021) * 0.18;

export const BACKGROUND_GIFTS: SeedGift[] = BACKGROUND_PEOPLE.filter(
  (person) => person.segment === 'FRIEND' || person.segment === 'DONOR' || person.constituentTypes.includes('DONOR'),
).flatMap((person) => {
  const firstYear = between(2021, 2025);
  const base = person.segment === 'FRIEND' ? pick([250, 500, 1000, 1500, 2500]) : pick([50, 100, 150, 250, 500]);
  const route = person.country === 'United Kingdom' ? 'UK_ROUTE' : person.country === 'United States' ? 'US_CAF_AMERICA' : 'ITALY_DIRECT';
  const gifts: SeedGift[] = [];
  for (let year = firstYear; year <= 2026; year += 1) {
    if (random() < 0.25) continue;
    const giftDate = year === 2026 ? dateIn(year, 1, 11) : dateIn(year, random() < 0.6 ? 11 : 1, 12);
    if (giftDate > TODAY) continue;
    const amount = Math.round((base * growth(year) * (0.8 + random() * 0.5)) / 10) * 10;
    const isAppealSeason = giftDate.slice(5, 7) >= '11';
    const appeal = isAppealSeason && year === 2025 ? 'annual2025' : isAppealSeason && year === 2026 ? 'annual2026' : undefined;
    gifts.push({
      name: appeal ? `Annual appeal gift ${year}` : `Gift ${year}`,
      amount,
      giftDate,
      giftType: 'DONATION',
      paymentType: route === 'ITALY_DIRECT' ? pick(['CARD', 'CARD', 'BANK_TRANSFER', 'CHEQUE']) : 'BANK_TRANSFER',
      donor: person.key,
      fund: pick(ANNUAL_FUNDS),
      appeal,
      givingRoute: route,
      originalAmount:
        route === 'UK_ROUTE'
          ? { amount: Math.round(amount / 1.17), currencyCode: 'GBP' }
          : route === 'US_CAF_AMERICA'
            ? { amount: Math.round(amount / 0.92), currencyCode: 'USD' }
            : undefined,
    });
  }
  return gifts;
});

// ---------------------------------------------------------------- background guests and gala gifts

const guestPool = BACKGROUND_PEOPLE.filter((person) => person.segment !== 'NEWSLETTER');
const sample = <TItem>(items: TItem[], count: number) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy.slice(0, count);
};

const pastGuests = (event: string, count: number, tablePrefix?: string): SeedGuest[] =>
  sample(guestPool, count).map((person, index) => {
    const roll = random();
    return {
      event,
      person: person.key,
      rsvpStatus: roll < 0.08 ? 'NO_SHOW' : roll < 0.16 ? 'DECLINED' : 'ATTENDED',
      guestRole: person.segment === 'INSTITUTIONAL' ? pick(['GUEST', 'PRESS', 'GUEST']) : 'GUEST',
      partySize: random() < 0.4 ? 2 : 1,
      tableName: tablePrefix ? `${tablePrefix} ${4 + (index % 9)}` : undefined,
      followUpDone: random() < 0.7,
    };
  });

export const BACKGROUND_GUESTS: SeedGuest[] = [
  ...pastGuests('spring2025', 28),
  ...pastGuests('vespers2026', 26),
  ...pastGuests('gala2026', 46, 'Table'),
  ...sample(guestPool, 16).map((person): SeedGuest => {
    const roll = random();
    return {
      event: 'rehearsal2026',
      person: person.key,
      rsvpStatus: roll < 0.45 ? 'ACCEPTED' : roll < 0.6 ? 'DECLINED' : 'INVITED',
      guestRole: 'GUEST',
      partySize: random() < 0.3 ? 2 : 1,
    };
  }),
];

export const GALA_NIGHT_GIFTS: SeedGift[] = BACKGROUND_GUESTS.filter(
  (guest) => guest.event === 'gala2026' && guest.rsvpStatus === 'ATTENDED',
)
  .slice(0, 14)
  .map((guest) => ({
    name: 'Gift on the night',
    amount: pick([100, 150, 250, 250, 500, 500, 1000, 2500]),
    giftDate: '2026-10-10',
    giftType: 'DONATION',
    paymentType: pick(['CARD', 'CARD', 'BANK_TRANSFER']),
    donor: guest.person,
    fund: 'mascaradeScholarships',
    appeal: 'gala2026',
    event: 'gala2026',
    givingRoute: 'ITALY_DIRECT',
  }));
