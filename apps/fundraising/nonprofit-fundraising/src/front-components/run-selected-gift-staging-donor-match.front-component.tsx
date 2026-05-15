import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { runSelectedGiftStagingDonorMatch } from 'src/gift-staging-review/gift-staging-selection.api';
import {
  broadcastSelectedGiftStagingInvalidated,
  normalizeSelectedRecordIds,
} from './gift-staging-selection-command-support';

export const RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '5b1d3f76-1bb7-4c6f-95d7-8c3d5ef0f632';
export const RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'e0dfda2e-bb49-42c0-a67f-4e5c802f76de';

const RunSelectedGiftStagingDonorMatch = () => {
  const selectedRecordIds = normalizeSelectedRecordIds(useSelectedRecordIds());

  useEffect(() => {
    const run = async () => {
      try {
        if (selectedRecordIds.length === 0) {
          throw new Error('Select at least one staged gift row first.');
        }

        await updateProgress(0.2);
        const result = await runSelectedGiftStagingDonorMatch({
          giftStagingIds: selectedRecordIds,
        });
        await updateProgress(1);
        broadcastSelectedGiftStagingInvalidated(selectedRecordIds);
        await enqueueSnackbar({
          message: `Donor match complete: ${result.autoLinkedRows} linked, ${result.ambiguousRows} ambiguous, ${result.unchangedRows} still unreviewed.`,
          variant: 'success',
        });
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Unable to run donor match on selected rows.',
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
    RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'run-selected-gift-staging-donor-match',
  description: 'Runs donor match on selected staged gift rows.',
  isHeadless: true,
  component: RunSelectedGiftStagingDonorMatch,
});
