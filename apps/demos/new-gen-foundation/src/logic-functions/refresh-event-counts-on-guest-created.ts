import { defineLogicFunction, type DatabaseEventPayload, type ObjectRecordCreateEvent } from 'twenty-sdk/define';

import { collectEventIds, recomputeEventCounts } from 'src/event-counts/recompute-event-counts';

type Guest = { foundationEventId?: string | null; rsvpStatus?: string | null };

const handler = async (event: DatabaseEventPayload<ObjectRecordCreateEvent<Guest>>) =>
  recomputeEventCounts(collectEventIds(event.properties.after));

export default defineLogicFunction({
  universalIdentifier: '65e1b4f4-14ec-4ab4-98a4-4a8c475f32c8',
  name: 'refresh-event-counts-on-guest-created',
  description: 'Updates the event\'s invited, accepted and attended counts when a guest is added.',
  timeoutSeconds: 30,
  handler,
  databaseEventTriggerSettings: { eventName: 'eventGuest.created' },
});
