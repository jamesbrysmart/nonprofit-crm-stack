import { describe, expect, it } from 'vitest';

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
} from 'src/seed/hero-data';

const people = new Set([...HERO_PEOPLE, ...BACKGROUND_PEOPLE].map((person) => person.key));
const organisations = new Set([...ORGANISATIONS, ...BACKGROUND_ORGANISATIONS].map((organisation) => organisation.key));
const programmes = new Set(PROGRAMMES.map((programme) => programme.key));
const funds = new Set(FUNDS.map((fund) => fund.key));
const appeals = new Set(APPEALS.map((appeal) => appeal.key));
const opportunities = new Set(OPPORTUNITIES.map((opportunity) => opportunity.key));
const events = new Set(EVENTS.map((event) => event.key));
const memberships = new Set(ALL_MEMBERSHIPS.map((membership) => membership.key));
const gifts = [...HERO_GIFTS, ...membershipGifts(ALL_MEMBERSHIPS), ...BACKGROUND_GIFTS, ...GALA_NIGHT_GIFTS];
const guests = [...HERO_GUESTS, ...BACKGROUND_GUESTS];

const expectKnown = (set: Set<string>, key: string | undefined) => {
  if (key !== undefined) expect(set, key).toContain(key);
};

describe('NGF seed data', () => {
  it('uses unique keys and emails', () => {
    const allPeople = [...HERO_PEOPLE, ...BACKGROUND_PEOPLE];
    expect(people.size).toBe(allPeople.length);
    expect(new Set(allPeople.map((person) => person.email)).size).toBe(allPeople.length);
    expect(memberships.size).toBe(ALL_MEMBERSHIPS.length);
  });

  it('only references records that exist', () => {
    [...HERO_PEOPLE, ...BACKGROUND_PEOPLE].forEach((person) => expectKnown(organisations, person.company));
    FUNDS.forEach((fund) => expectKnown(programmes, fund.programme));
    APPEALS.forEach((appeal) => expectKnown(funds, appeal.defaultFund));
    OPPORTUNITIES.forEach((opportunity) => {
      expectKnown(organisations, opportunity.company);
      expectKnown(people, opportunity.pointOfContact);
      expectKnown(programmes, opportunity.programme);
    });
    ROLES.forEach((role) => {
      expectKnown(people, role.person);
      expectKnown(programmes, role.programme);
      expectKnown(opportunities, role.scholarship);
    });
    RELATIONSHIPS.forEach((relationship) => {
      expectKnown(people, relationship.person);
      expectKnown(people, relationship.relatedPerson);
      expectKnown(organisations, relationship.relatedOrganisation);
      expect(Boolean(relationship.relatedPerson) !== Boolean(relationship.relatedOrganisation)).toBe(true);
    });
    EVENTS.forEach((event) => {
      expectKnown(organisations, event.venue);
      expectKnown(programmes, event.programme);
      expectKnown(opportunities, event.sponsorship);
    });
    guests.forEach((guest) => {
      expectKnown(events, guest.event);
      expectKnown(people, guest.person);
    });
    ALL_MEMBERSHIPS.forEach((membership) => expectKnown(people, membership.person));
    gifts.forEach((gift) => {
      expect(Boolean(gift.donor) || Boolean(gift.company), gift.name).toBe(true);
      expectKnown(people, gift.donor);
      expectKnown(organisations, gift.company);
      expectKnown(funds, gift.fund);
      expectKnown(appeals, gift.appeal);
      expectKnown(opportunities, gift.opportunity);
      expectKnown(events, gift.event);
      expectKnown(memberships, gift.membership);
      expectKnown(people, gift.softCreditPerson);
    });
    [...TASKS, ...NOTES].forEach((item) => {
      (item.targets.people ?? []).forEach((key) => expectKnown(people, key));
      (item.targets.companies ?? []).forEach((key) => expectKnown(organisations, key));
      (item.targets.opportunities ?? []).forEach((key) => expectKnown(opportunities, key));
    });
  });

  it('invites each person to an event at most once', () => {
    const pairs = guests.map((guest) => `${guest.event}:${guest.person}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it('keeps every gift in the past and in EUR-sized amounts', () => {
    gifts.forEach((gift) => {
      expect(gift.giftDate <= '2026-11-17', gift.name).toBe(true);
      expect(gift.amount).toBeGreaterThan(0);
    });
  });

  it('has a volume that reads as a small foundation', () => {
    const byYear = gifts.reduce<Record<string, number>>((totals, gift) => {
      const year = gift.giftDate.slice(0, 4);
      totals[year] = (totals[year] ?? 0) + gift.amount;
      return totals;
    }, {});
    console.log({
      people: people.size,
      organisations: organisations.size,
      gifts: gifts.length,
      memberships: memberships.size,
      guests: guests.length,
      incomeByYear: byYear,
    });
    expect(people.size).toBeGreaterThan(100);
  });
});
