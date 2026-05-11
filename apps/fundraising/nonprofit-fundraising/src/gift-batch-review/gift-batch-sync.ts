const CHANNEL_NAME = 'nonprofit-fundraising:gift-batch-sync';

type GiftBatchInvalidationMessage = {
  type: 'gift-batch-invalidated';
  recordId: string;
};

const createChannel = () => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(CHANNEL_NAME);
};

export const broadcastGiftBatchInvalidated = (recordId: string) => {
  const trimmedRecordId = recordId.trim();

  if (trimmedRecordId === '') {
    return;
  }

  const channel = createChannel();

  if (!channel) {
    return;
  }

  const message: GiftBatchInvalidationMessage = {
    type: 'gift-batch-invalidated',
    recordId: trimmedRecordId,
  };

  channel.postMessage(message);
  channel.close();
};

export const subscribeToGiftBatchInvalidated = ({
  recordId,
  onInvalidate,
}: {
  recordId: string;
  onInvalidate: () => void | Promise<void>;
}) => {
  const trimmedRecordId = recordId.trim();
  const channel = createChannel();

  if (!channel || trimmedRecordId === '') {
    return () => {};
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    const payload = event.data;

    if (
      !payload ||
      typeof payload !== 'object' ||
      (payload as { type?: unknown }).type !== 'gift-batch-invalidated' ||
      (payload as { recordId?: unknown }).recordId !== trimmedRecordId
    ) {
      return;
    }

    void onInvalidate();
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel.removeEventListener('message', handleMessage);
    channel.close();
  };
};
