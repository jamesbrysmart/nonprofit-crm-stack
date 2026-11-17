import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordDeleteEvent } from 'twenty-sdk/define';

import { collectEventIds, recomputeEventCounts } from 'src/event-counts/recompute-event-counts';

type Guest = { foundationEventId?: string | null; rsvpStatus?: string | null };

const handler = async (event: DatabaseEventPayload<ObjectRecordDeleteEvent<Guest>>) =>
  recomputeEventCounts(collectEventIds(event.properties.before));

export default defineLogicFunction({
  universalIdentifier: 'bf67e856-5678-4ff5-a6ae-6bb9eddea2d6',
  name: 'refresh-event-counts-on-guest-deleted',
  description: 'Updates the event\'s invited, accepted and attended counts when a guest is removed.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'eventGuest.deleted' },
});
