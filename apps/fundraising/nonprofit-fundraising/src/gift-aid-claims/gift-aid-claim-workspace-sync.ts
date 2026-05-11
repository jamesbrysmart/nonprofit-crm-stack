const CHANNEL_NAME = 'nonprofit-fundraising:gift-aid-claim-workspace-sync';

type GiftAidClaimWorkspaceInvalidationMessage = {
  type: 'gift-aid-claim-workspace-invalidated';
  batchId: string;
};

const createChannel = () => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(CHANNEL_NAME);
};

export const broadcastGiftAidClaimWorkspaceInvalidated = (batchId: string) => {
  const trimmedBatchId = batchId.trim();

  if (trimmedBatchId === '') {
    return;
  }

  const channel = createChannel();

  if (!channel) {
    return;
  }

  const message: GiftAidClaimWorkspaceInvalidationMessage = {
    type: 'gift-aid-claim-workspace-invalidated',
    batchId: trimmedBatchId,
  };

  channel.postMessage(message);
  channel.close();
};

export const subscribeToGiftAidClaimWorkspaceInvalidated = ({
  batchId,
  onInvalidate,
}: {
  batchId: string;
  onInvalidate: () => void | Promise<void>;
}) => {
  const trimmedBatchId = batchId.trim();
  const channel = createChannel();

  if (!channel || trimmedBatchId === '') {
    return () => {};
  }

  const handleMessage = (event: MessageEvent<unknown>) => {
    const payload = event.data;

    if (
      !payload ||
      typeof payload !== 'object' ||
      (payload as { type?: unknown }).type !==
        'gift-aid-claim-workspace-invalidated' ||
      (payload as { batchId?: unknown }).batchId !== trimmedBatchId
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
