import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import {
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  SET_GIFT_REPORTING_AMOUNT_ON_GIFT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { syncGiftReportingValues } from 'src/reporting-currency/gift-reporting-sync';

// Covers every way a gift can be created, including imports, workflows and
// the API, not only the app's own entry paths.
const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordCreateEvent<{ id?: string }>>,
) => syncGiftReportingValues(batch.events.map((event) => event.recordId));

export default defineLogicFunction({
  universalIdentifier:
    SET_GIFT_REPORTING_AMOUNT_ON_GIFT_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'set-gift-reporting-amount-on-gift-created',
  description:
    "Sets a new gift's reporting amount and status in the organisation's reporting currency.",
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'created',
    batchMode: true,
  },
});
