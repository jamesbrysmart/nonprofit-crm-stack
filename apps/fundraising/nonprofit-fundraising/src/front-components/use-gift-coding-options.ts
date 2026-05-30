import { useEffect, useState } from 'react';
import {
  listAppealOptions,
  listAppealSourceOptions,
  listFundOptions,
} from 'src/manual-gift-entry/manual-gift-entry.api';
import type {
  AppealSummary,
  AppealSourceSummary,
  FundSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

export const useGiftCodingOptions = ({
  includeAppealSources = true,
  selectedAppealId = '',
}: {
  includeAppealSources?: boolean;
  selectedAppealId?: string;
} = {}) => {
  const [appeals, setAppeals] = useState<AppealSummary[]>([]);
  const [appealSources, setAppealSources] = useState<AppealSourceSummary[]>([]);
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [loadingAppeals, setLoadingAppeals] = useState(false);
  const [loadingAppealSources, setLoadingAppealSources] = useState(false);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [appealOptionsError, setAppealOptionsError] = useState<string | null>(
    null,
  );
  const [appealSourceOptionsError, setAppealSourceOptionsError] = useState<
    string | null
  >(null);
  const [fundOptionsError, setFundOptionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingAppeals(true);
    setAppealOptionsError(null);

    void listAppealOptions()
      .then((result) => {
        if (!cancelled) {
          setAppeals(result.appeals);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setAppeals([]);
          setAppealOptionsError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load appeals.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAppeals(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!includeAppealSources) {
      setAppealSources([]);
      setAppealSourceOptionsError(null);
      setLoadingAppealSources(false);
      return;
    }

    let cancelled = false;
    setLoadingAppealSources(true);
    setAppealSourceOptionsError(null);

    void listAppealSourceOptions(
      selectedAppealId !== '' ? { appealId: selectedAppealId } : {},
    )
      .then((result) => {
        if (!cancelled) {
          setAppealSources(result.appealSources);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setAppealSources([]);
          setAppealSourceOptionsError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load appeal sources.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAppealSources(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [includeAppealSources, selectedAppealId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingFunds(true);
    setFundOptionsError(null);

    void listFundOptions()
      .then((result) => {
        if (!cancelled) {
          setFunds(result.funds);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setFunds([]);
          setFundOptionsError(
            loadError instanceof Error ? loadError.message : 'Unable to load funds.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingFunds(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    appeals,
    appealSources,
    funds,
    loadingAppeals,
    loadingAppealSources,
    loadingFunds,
    appealOptionsError,
    appealSourceOptionsError,
    fundOptionsError,
  };
};
