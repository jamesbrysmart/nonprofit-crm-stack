import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { checkSelectedGiftStagingReadiness } from 'src/gift-staging-review/gift-staging-selection.api';
import {
  broadcastSelectedGiftStagingInvalidated,
  normalizeSelectedRecordIds,
} from './gift-staging-selection-command-support';

export const CHECK_SELECTED_GIFT_STAGING_READINESS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'dff9c3fe-c7d9-47e2-8b9c-a7ef53497388';
export const CHECK_SELECTED_GIFT_STAGING_READINESS_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'b973061a-b6a6-4c03-9233-fde6acfc214b';

const CheckSelectedGiftStagingReadiness = () => {
  const selectedRecordIds = normalizeSelectedRecordIds(useSelectedRecordIds());

  useEffect(() => {
    const run = async () => {
      try {
        if (selectedRecordIds.length === 0) {
          throw new Error('Select at least one staged gift row first.');
        }

        await updateProgress(0.2);
        const result = await checkSelectedGiftStagingReadiness({
          giftStagingIds: selectedRecordIds,
        });
        await updateProgress(1);
        broadcastSelectedGiftStagingInvalidated(selectedRecordIds);
        await enqueueSnackbar({
          message: `Readiness checked: ${result.readyItems} ready, ${result.needsReviewItems} need review, ${result.failedItems} failed previously.`,
          variant: 'success',
        });
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Unable to check readiness for selected rows.',
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
    CHECK_SELECTED_GIFT_STAGING_READINESS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'check-selected-gift-staging-readiness',
  description: 'Checks readiness on selected staged gift rows.',
  isHeadless: true,
  component: CheckSelectedGiftStagingReadiness,
});
