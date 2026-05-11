const CHANNEL_NAME = 'nonprofit-fundraising:gift-record-sync';

type GiftRecordInvalidationMessage = {
  type: 'gift-record-invalidated';
  recordId: string;
};

const createChannel = () => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(CHANNEL_NAME);
};

export const broadcastGiftRecordInvalidated = (recordId: string) => {
  const trimmedRecordId = recordId.trim();

  if (trimmedRecordId === '') {
    return;
  }

  const channel = createChannel();

  if (!channel) {
    return;
  }

  const message: GiftRecordInvalidationMessage = {
    type: 'gift-record-invalidated',
    recordId: trimmedRecordId,
  };

  channel.postMessage(message);
  channel.close();
};

export const subscribeToGiftRecordInvalidated = ({
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
      (payload as { type?: unknown }).type !== 'gift-record-invalidated' ||
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

