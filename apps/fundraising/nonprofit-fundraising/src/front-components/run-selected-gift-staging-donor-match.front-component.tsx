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
  normalizeSelectedRecordIds,
} from './gift-staging-selection-command-support';
import {
  RUN_SELECTED_GIFT_STAGING_DONOR_MATCH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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
