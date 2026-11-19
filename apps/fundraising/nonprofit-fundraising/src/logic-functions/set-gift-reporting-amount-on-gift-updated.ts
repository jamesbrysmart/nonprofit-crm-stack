import {
  defineLogicFunction,
  type DatabaseEventBatchPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';
import {
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_REPORTING_AMOUNT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SET_GIFT_REPORTING_AMOUNT_ON_GIFT_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { syncGiftReportingValues } from 'src/reporting-currency/gift-reporting-sync';

// Keeps the status consistent when someone enters a reporting amount or the
// amount changes. Its own writes re-trigger it once and then change nothing.
const handler = async (
  batch: DatabaseEventBatchPayload<ObjectRecordUpdateEvent<{ id?: string }>>,
) => syncGiftReportingValues(batch.events.map((event) => event.recordId));

export default defineLogicFunction({
  universalIdentifier:
    SET_GIFT_REPORTING_AMOUNT_ON_GIFT_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'set-gift-reporting-amount-on-gift-updated',
  description:
    "Keeps a gift's reporting amount and status consistent when its amounts change.",
  timeoutSeconds: 60,
  handler,
  eventTriggerSettings: {
    on: 'recordEvent',
    objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
    action: 'updated',
    batchMode: true,
    watchedFieldUniversalIdentifiers: [
      GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_REPORTING_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_REPORTING_AMOUNT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      GIFT_GROSS_PAYMENT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
    ],
  },
});
