import { useEffect } from 'react';
import {
  defineFrontComponent,
  enqueueSnackbar,
  unmountFrontComponent,
  updateProgress,
  useRecordId,
} from 'twenty-sdk';
import { processBatch } from 'src/batch-processing/batch-processing.api';
import { GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/gift-batch.object';

export const PROCESS_GIFT_BATCH_COMMAND_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '44d93c5a-e7c6-463e-8b88-b56b508c6c60';

const PROCESS_GIFT_BATCH_COMMAND_UNIVERSAL_IDENTIFIER =
  '3b54bb3e-3e8a-4e56-81f1-c8557ef9d6a9';

const ProcessGiftBatchCommand = () => {
  const recordId = useRecordId();

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        await enqueueSnackbar({
          message: 'No gift batch selected.',
          variant: 'error',
        });
        await unmountFrontComponent();
        return;
      }

      try {
        await updateProgress(0.1);

        const result = await processBatch({
          giftBatchId: recordId,
        });

        await updateProgress(1);
        await enqueueSnackbar({
          message: `Batch processed: ${result.processedItems} processed, ${result.failedItems} failed, ${result.notReadyItems} not ready.`,
          variant: 'success',
        });
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Unable to process batch.',
          variant: 'error',
        });
      } finally {
        await unmountFrontComponent();
      }
    };

    void run();
  }, [recordId]);

  return null;
};

export default defineFrontComponent({
  universalIdentifier:
    PROCESS_GIFT_BATCH_COMMAND_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'process-gift-batch-command',
  description:
    'Headless gift-batch processing command for testing native Twenty command context.',
  isHeadless: true,
  component: ProcessGiftBatchCommand,
  command: {
    universalIdentifier: PROCESS_GIFT_BATCH_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'Process batch',
    shortLabel: 'Process batch',
    icon: 'IconPlayerPlay',
    isPinned: true,
    availabilityType: 'RECORD_SELECTION',
    availabilityObjectUniversalIdentifier:
      GIFT_BATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  },
});
