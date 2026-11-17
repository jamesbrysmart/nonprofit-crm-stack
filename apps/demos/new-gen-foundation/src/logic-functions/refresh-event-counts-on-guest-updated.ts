import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordUpdateEvent } from 'twenty-sdk/define';

import { collectEventIds, recomputeEventCounts } from 'src/event-counts/recompute-event-counts';

type Guest = { foundationEventId?: string | null; rsvpStatus?: string | null };

const handler = async (event: DatabaseEventPayload<ObjectRecordUpdateEvent<Guest>>) =>
  recomputeEventCounts(collectEventIds(event.properties.before, event.properties.after));

export default defineLogicFunction({
  universalIdentifier: 'c27d5387-216d-4600-a12b-cc593128f403',
  name: 'refresh-event-counts-on-guest-updated',
  description: 'Updates the event\'s invited, accepted and attended counts when a guest\'s RSVP or event changes.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'eventGuest.updated', updatedFields: ['rsvpStatus', 'foundationEventId'] },
});
