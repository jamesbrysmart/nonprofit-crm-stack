import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { useRecordId } from 'twenty-sdk/front-component';
import { loadGiftAidClaimWorkspace } from 'src/gift-aid-claims/gift-aid-claim-batch';
import { subscribeToGiftAidClaimWorkspaceInvalidated } from 'src/gift-aid-claims/gift-aid-claim-workspace-sync';
import type { GiftAidClaimWorkspaceRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

const loadWorkspace = async (
  recordId: string,
): Promise<GiftAidClaimWorkspaceRecord> => {
  const client = new CoreApiClient();
  return await loadGiftAidClaimWorkspace(client, recordId);
};

export const useGiftAidClaimWorkspace = () => {
  const recordId = useRecordId();
  const [workspace, setWorkspace] = useState<GiftAidClaimWorkspaceRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!recordId) {
      setError('No claim batch selected');
      setWorkspace(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setWorkspace(await loadWorkspace(recordId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load claim workspace',
      );
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return;
    }

    return subscribeToGiftAidClaimWorkspaceInvalidated({
      batchId: recordId,
      onInvalidate: refresh,
    });
  }, [recordId]);

  return {
    recordId,
    workspace,
    loading,
    error,
    refresh,
  };
};
