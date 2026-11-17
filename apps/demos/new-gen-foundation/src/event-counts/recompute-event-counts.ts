import { graphql } from 'src/utils/graphql';

type GuestRecord = { foundationEventId?: string | null; rsvpStatus?: string | null };

const ACCEPTED_STATUSES = ['ACCEPTED', 'ATTENDED', 'NO_SHOW'];

export const collectEventIds = (...records: Array<GuestRecord | undefined>) => [
  ...new Set(records.map((record) => record?.foundationEventId).filter((id): id is string => typeof id === 'string')),
];

// Keeps the Invited / Accepted / Attended counters on Event in step with its guest list.
export const recomputeEventCounts = async (eventIds: string[]) => {
  for (const eventId of eventIds) {
    const data = await graphql<{ eventGuests: { edges: Array<{ node: { rsvpStatus: string | null } }> } }>(
      `query Guests($eventId: UUID!) { eventGuests(filter: { foundationEventId: { eq: $eventId } }, first: 1000) { edges { node { rsvpStatus } } } }`,
      { eventId },
    );
    const statuses = data.eventGuests.edges.map((edge) => edge.node.rsvpStatus ?? '');
    await graphql(
      `mutation Update($eventId: UUID!, $data: FoundationEventUpdateInput!) { updateFoundationEvent(id: $eventId, data: $data) { id } }`,
      {
        eventId,
        data: {
          invitedCount: statuses.length,
          acceptedCount: statuses.filter((status) => ACCEPTED_STATUSES.includes(status)).length,
          attendedCount: statuses.filter((status) => status === 'ATTENDED').length,
        },
      },
    );
  }
  return { updatedEventCount: eventIds.length };
};
