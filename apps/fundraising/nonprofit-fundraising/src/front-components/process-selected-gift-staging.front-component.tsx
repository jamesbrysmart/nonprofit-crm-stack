import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { processSelectedGiftStaging } from 'src/gift-staging-review/gift-staging-selection.api';
import {
  broadcastSelectedGiftStagingInvalidated,
  normalizeSelectedRecordIds,
} from './gift-staging-selection-command-support';

export const PROCESS_SELECTED_GIFT_STAGING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'bb85f786-7d28-43bd-95f9-7aaef6cc97dc';
export const PROCESS_SELECTED_GIFT_STAGING_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '721b1bf0-1db1-4f98-b429-509053292f5f';

const ProcessSelectedGiftStaging = () => {
  const selectedRecordIds = normalizeSelectedRecordIds(useSelectedRecordIds());

  useEffect(() => {
    const run = async () => {
      try {
        if (selectedRecordIds.length === 0) {
          throw new Error('Select at least one staged gift row first.');
        }

        await updateProgress(0.1);
        const result = await processSelectedGiftStaging({
          giftStagingIds: selectedRecordIds,
        });
        await updateProgress(1);
        broadcastSelectedGiftStagingInvalidated(selectedRecordIds);
        await enqueueSnackbar({
          message: `Selected rows processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
          variant: 'success',
        });
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Unable to process selected rows.',
          variant: 'error',
        });
      } finally {
        await unmountFrontComponent();
      }
    };

    void run();
  }, [selectedRecordIds]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier:
    PROCESS_SELECTED_GIFT_STAGING_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'process-selected-gift-staging',
  description: 'Processes selected staged gift rows.',
  isHeadless: true,
  component: ProcessSelectedGiftStaging,
});
