import { defineLogicFunction } from 'twenty-sdk/define';

import {
  ALL_MEMBERSHIPS,
  BACKGROUND_GIFTS,
  BACKGROUND_GUESTS,
  BACKGROUND_ORGANISATIONS,
  BACKGROUND_PEOPLE,
  GALA_NIGHT_GIFTS,
  membershipGifts,
} from 'src/seed/background-data';
import {
  APPEALS,
  EVENTS,
  FUNDS,
  HERO_GIFTS,
  HERO_GUESTS,
  HERO_PEOPLE,
  NOTES,
  OPPORTUNITIES,
  ORGANISATIONS,
  PROGRAMMES,
  RELATIONSHIPS,
  ROLES,
  TASKS,
  type Key,
  type SeedPerson,
} from 'src/seed/hero-data';
import { graphql } from 'src/utils/graphql';

type Row = Record<string, unknown>;

const BATCH_SIZE = 60;

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Creates rows in batches and returns their ids in input order.
const createMany = async (objectNamePlural: string, rows: Row[]): Promise<string[]> => {
  const mutation = `create${capitalise(objectNamePlural)}`;
  const ids: string[] = [];
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const data = await graphql<Record<string, Array<{ id: string }>>>(
      `mutation Seed($data: [${capitalise(singular(objectNamePlural))}CreateInput!]!) { ${mutation}(data: $data) { id } }`,
      { data: batch },
    );
    ids.push(...data[mutation].map((record) => record.id));
  }
  return ids;
};

const SINGULAR: Record<string, string> = {
  people: 'person',
  companies: 'company',
  opportunities: 'opportunity',
  programmes: 'programme',
  programmeRoles: 'programmeRole',
  relationships: 'relationship',
  foundationEvents: 'foundationEvent',
  eventGuests: 'eventGuest',
  memberships: 'membership',
  funds: 'fund',
  appeals: 'appeal',
  gifts: 'gift',
  tasks: 'task',
  taskTargets: 'taskTarget',
  notes: 'note',
  noteTargets: 'noteTarget',
};
const singular = (plural: string) => SINGULAR[plural];

const euros = (amount: number, currencyCode = 'EUR') => ({
  amountMicros: Math.round(amount * 1_000_000),
  currencyCode,
});

const indexIds = (keys: Key[], ids: string[]) => new Map(keys.map((key, index) => [key, ids[index]]));

const lookup = (map: Map<Key, string>, key: Key | undefined, label: string) => {
  if (key === undefined) return undefined;
  const id = map.get(key);
  if (id === undefined) throw new Error(`Unknown ${label} key: ${key}`);
  return id;
};

const personRow = (person: SeedPerson, companyIds: Map<Key, string>): Row => ({
  name: { firstName: person.firstName, lastName: person.lastName },
  emails: { primaryEmail: person.email },
  jobTitle: person.jobTitle ?? '',
  companyId: lookup(companyIds, person.company, 'organisation'),
  constituentTypes: person.constituentTypes,
  preferredLanguage: person.preferredLanguage,
  newsletterStatus: person.newsletterStatus,
  contactPreferences: person.contactPreferences,
  consentDate: person.consentDate,
  consentSource: person.consentSource,
  profile: person.profile,
  mailingAddress: { addressCity: person.city, addressCountry: person.country },
});

const handler = async (): Promise<{ message: string; counts: Record<string, number> }> => {
  const existing = await graphql<{ programmes: { totalCount: number } }>(
    `query { programmes(filter: { name: { eq: "Mascarade Opera" } }) { totalCount } }`,
  );
  if (existing.programmes.totalCount > 0) {
    return { message: 'NGF demo data already present; nothing created.', counts: {} };
  }

  const counts: Record<string, number> = {};
  const create = async (plural: string, rows: Row[]) => {
    const ids = await createMany(plural, rows);
    counts[plural] = (counts[plural] ?? 0) + ids.length;
    return ids;
  };

  // Organisations and people
  const organisations = [...ORGANISATIONS, ...BACKGROUND_ORGANISATIONS];
  const companyIds = indexIds(
    organisations.map((organisation) => organisation.key),
    await create(
      'companies',
      organisations.map((organisation) => ({
        name: organisation.name,
        organisationType: organisation.organisationType,
        address: { addressCity: organisation.city, addressCountry: organisation.country },
        domainName: organisation.domain ? { primaryLinkUrl: `https://${organisation.domain}` } : undefined,
      })),
    ),
  );
  const people = [...HERO_PEOPLE, ...BACKGROUND_PEOPLE];
  const personIds = indexIds(
    people.map((person) => person.key),
    await create('people', people.map((person) => personRow(person, companyIds))),
  );

  // Programmes, funds, appeals
  const programmeIds = indexIds(
    PROGRAMMES.map((programme) => programme.key),
    await create(
      'programmes',
      PROGRAMMES.map(({ key: _key, ...programme }) => programme),
    ),
  );
  const fundIds = indexIds(
    FUNDS.map((fund) => fund.key),
    await create(
      'funds',
      FUNDS.map((fund) => ({
        name: fund.name,
        code: fund.code,
        description: fund.description,
        restrictionType: fund.restrictionType,
        isActive: true,
        programmeId: lookup(programmeIds, fund.programme, 'programme'),
      })),
    ),
  );
  const appealIds = indexIds(
    APPEALS.map((appeal) => appeal.key),
    await create(
      'appeals',
      APPEALS.map((appeal) => ({
        name: appeal.name,
        description: appeal.description,
        status: appeal.status,
        appealType: appeal.appealType,
        startDate: appeal.startDate,
        endDate: appeal.endDate,
        goalAmount: euros(appeal.goalAmount),
        defaultFundId: lookup(fundIds, appeal.defaultFund, 'fund'),
      })),
    ),
  );

  // Opportunities
  const opportunityIds = indexIds(
    OPPORTUNITIES.map((opportunity) => opportunity.key),
    await create(
      'opportunities',
      OPPORTUNITIES.map((opportunity) => ({
        name: opportunity.name,
        amount: euros(opportunity.amount),
        stage: opportunity.stage,
        closeDate: opportunity.closeDate,
        companyId: lookup(companyIds, opportunity.company, 'organisation'),
        pointOfContactId: lookup(personIds, opportunity.pointOfContact, 'person'),
        programmeId: lookup(programmeIds, opportunity.programme, 'programme'),
        fundingType: opportunity.fundingType,
        awardedAmount: opportunity.awardedAmount ? euros(opportunity.awardedAmount) : undefined,
        applicationDeadline: opportunity.applicationDeadline,
        submittedDate: opportunity.submittedDate,
        fundingPeriodStart: opportunity.fundingPeriodStart,
        fundingPeriodEnd: opportunity.fundingPeriodEnd,
      })),
    ),
  );

  const personName = (key: Key) => {
    const person = people.find((candidate) => candidate.key === key);
    return person ? `${person.firstName} ${person.lastName}` : key;
  };
  const programmeName = (key: Key) => PROGRAMMES.find((programme) => programme.key === key)?.name ?? key;
  const organisationName = (key: Key) => organisations.find((organisation) => organisation.key === key)?.name ?? key;

  // Programme roles and relationships
  await create(
    'programmeRoles',
    ROLES.map((role) => ({
      name: `${personName(role.person)}, ${programmeName(role.programme)}`,
      artisticRole: role.role,
      status: role.status,
      cohort: role.cohort,
      startDate: role.startDate,
      endDate: role.endDate,
      notes: role.notes,
      personId: lookup(personIds, role.person, 'person'),
      programmeId: lookup(programmeIds, role.programme, 'programme'),
      scholarshipId: lookup(opportunityIds, role.scholarship, 'opportunity'),
    })),
  );
  await create(
    'relationships',
    RELATIONSHIPS.map((relationship) => ({
      name: `${personName(relationship.person)} → ${
        relationship.relatedPerson ? personName(relationship.relatedPerson) : organisationName(relationship.relatedOrganisation ?? '')
      }`,
      relationshipType: relationship.relationshipType,
      startDate: relationship.startDate,
      endDate: relationship.endDate,
      notes: relationship.notes,
      personId: lookup(personIds, relationship.person, 'person'),
      relatedPersonId: lookup(personIds, relationship.relatedPerson, 'person'),
      relatedOrganisationId: lookup(companyIds, relationship.relatedOrganisation, 'organisation'),
    })),
  );

  // Events and guests, with RSVP counts derived from the guest list
  const guests = [...HERO_GUESTS, ...BACKGROUND_GUESTS];
  const countGuests = (eventKey: Key, statuses: string[]) =>
    guests.filter((guest) => guest.event === eventKey && statuses.includes(guest.rsvpStatus)).length;
  const eventIds = indexIds(
    EVENTS.map((event) => event.key),
    await create(
      'foundationEvents',
      EVENTS.map((event) => ({
        name: event.name,
        eventType: event.eventType,
        status: event.status,
        startsAt: event.startsAt,
        city: event.city,
        capacity: event.capacity,
        description: event.description,
        incomeTarget: event.incomeTarget ? euros(event.incomeTarget) : undefined,
        invitedCount: guests.filter((guest) => guest.event === event.key).length,
        acceptedCount: countGuests(event.key, ['ACCEPTED', 'ATTENDED', 'NO_SHOW']),
        attendedCount: countGuests(event.key, ['ATTENDED']),
        venueId: lookup(companyIds, event.venue, 'organisation'),
        programmeId: lookup(programmeIds, event.programme, 'programme'),
        sponsorshipId: lookup(opportunityIds, event.sponsorship, 'opportunity'),
      })),
    ),
  );
  await create(
    'eventGuests',
    guests.map((guest) => ({
      name: personName(guest.person),
      rsvpStatus: guest.rsvpStatus,
      guestRole: guest.guestRole,
      partySize: guest.partySize ?? 1,
      tableName: guest.tableName,
      notes: guest.notes,
      followUpDone: guest.followUpDone ?? false,
      foundationEventId: lookup(eventIds, guest.event, 'event'),
      personId: lookup(personIds, guest.person, 'person'),
    })),
  );

  // Memberships and gifts
  const fees = { FRIEND: 1000, UNDER_35: 200, HONORARY: 0 } as const;
  const membershipIds = indexIds(
    ALL_MEMBERSHIPS.map((membership) => membership.key),
    await create(
      'memberships',
      ALL_MEMBERSHIPS.map((membership) => ({
        name: `${personName(membership.person)}, ${membership.tier === 'FRIEND' ? 'Friend' : membership.tier === 'UNDER_35' ? 'Under-35' : 'Honorary'}`,
        tier: membership.tier,
        status: membership.status,
        memberSince: membership.memberSince,
        startDate: membership.startDate,
        endDate: membership.endDate,
        annualFee: euros(fees[membership.tier]),
        personId: lookup(personIds, membership.person, 'person'),
      })),
    ),
  );
  const gifts = [...HERO_GIFTS, ...membershipGifts(ALL_MEMBERSHIPS), ...BACKGROUND_GIFTS, ...GALA_NIGHT_GIFTS];
  await create(
    'gifts',
    gifts.map((gift) => ({
      name: gift.name,
      description: gift.description,
      amount: euros(gift.amount),
      giftDate: gift.giftDate,
      giftType: gift.giftType,
      paymentType: gift.paymentType,
      givingRoute: gift.givingRoute,
      originalAmount: gift.originalAmount ? euros(gift.originalAmount.amount, gift.originalAmount.currencyCode) : undefined,
      softCreditType: gift.softCreditType,
      donorId: lookup(personIds, gift.donor, 'person'),
      companyId: lookup(companyIds, gift.company, 'organisation'),
      fundId: lookup(fundIds, gift.fund, 'fund'),
      appealId: lookup(appealIds, gift.appeal, 'appeal'),
      opportunityId: lookup(opportunityIds, gift.opportunity, 'opportunity'),
      foundationEventId: lookup(eventIds, gift.event, 'event'),
      membershipId: lookup(membershipIds, gift.membership, 'membership'),
      softCreditPersonId: lookup(personIds, gift.softCreditPerson, 'person'),
    })),
  );

  // Tasks and notes, linked to their people, organisations and opportunities
  const targetRows = (targets: { people?: Key[]; companies?: Key[]; opportunities?: Key[] }) => [
    ...(targets.people ?? []).map((key) => ({ targetPersonId: lookup(personIds, key, 'person') })),
    ...(targets.companies ?? []).map((key) => ({ targetCompanyId: lookup(companyIds, key, 'organisation') })),
    ...(targets.opportunities ?? []).map((key) => ({ targetOpportunityId: lookup(opportunityIds, key, 'opportunity') })),
  ];
  const taskIds = await create(
    'tasks',
    TASKS.map((task) => ({ title: task.title, bodyV2: { markdown: task.body }, dueAt: task.dueAt, status: task.status })),
  );
  await create(
    'taskTargets',
    TASKS.flatMap((task, index) => targetRows(task.targets).map((target) => ({ ...target, taskId: taskIds[index] }))),
  );
  const noteIds = await create(
    'notes',
    NOTES.map((note) => ({ title: note.title, bodyV2: { markdown: note.body } })),
  );
  await create(
    'noteTargets',
    NOTES.flatMap((note, index) => targetRows(note.targets).map((target) => ({ ...target, noteId: noteIds[index] }))),
  );

  return { message: 'NGF demo data created.', counts };
};

export default defineLogicFunction({
  universalIdentifier: '8733d4b2-89b0-4bb8-a5aa-05568da1700f',
  name: 'seed-ngf-demo',
  description:
    'Seeds the fictional NGF demo world: programmes, artists, supporters, organisations, events, memberships, gifts, tasks and notes. Does nothing if the data is already present.',
  timeoutSeconds: 300,
  handler,
});
