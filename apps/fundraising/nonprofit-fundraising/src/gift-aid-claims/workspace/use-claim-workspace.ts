import { useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { loadGiftAidClaimWorkspace } from 'src/gift-aid-claims/gift-aid-claim-batch.queries';
import type { GiftAidClaimWorkspaceRecord } from 'src/gift-aid-claims/gift-aid-claim.types';

// Keeps the loaded claim on screen while reloading, so a refresh after an
// action or tab change does not flash a loading state.
export const useClaimWorkspace = (recordId: string | null) => {
  const [workspace, setWorkspace] = useState<GiftAidClaimWorkspaceRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!recordId) {
      setWorkspace(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      setWorkspace(
        await loadGiftAidClaimWorkspace(new CoreApiClient(), recordId),
      );
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load claim workspace',
      );
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { workspace, loading, error, refresh };
};
