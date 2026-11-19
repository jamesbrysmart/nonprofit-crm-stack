import { defineLogicFunction } from 'twenty-sdk/define';
import { BACKFILL_GIFT_REPORTING_AMOUNTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { backfillAllGiftReportingValues } from 'src/reporting-currency/gift-reporting-sync';

// Run once after choosing the reporting currency (twenty app exec). It only
// fills the reporting fields; gift amounts are never changed.
export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_GIFT_REPORTING_AMOUNTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-gift-reporting-amounts',
  description:
    'Sets the reporting amount and status on existing gifts after the reporting currency is chosen.',
  timeoutSeconds: 900,
  handler: async () => backfillAllGiftReportingValues(),
});
