import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { extractConnectionNodes } from 'src/core-api/core-api-results';
import {
  SummaryStrip,
  SummaryStripItem,
  badgeStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
} from 'src/front-components/front-component-ui';
import {
  FUND_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const GIFT_PAGE_SIZE = 100;

type CurrencyAmount = {
  amountMicros?: number | null;
  currencyCode?: string | null;
} | null;

type FundSummaryRecord = {
  id: string;
  name?: string | null;
  code?: string | null;
  restrictionType?: string | null;
  isActive?: boolean | null;
  externalAccountingCode?: string | null;
};

type FundGiftRecord = {
  id: string;
  giftDate?: string | null;
  giftType?: string | null;
  amount?: CurrencyAmount;
};

type FundGivingSummary = {
  lifetimeMicros: number;
  thisYearMicros: number;
  lastYearMicros: number;
  giftCount: number;
  latestGiftDate: string | null;
  currencyCode: string;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatEnumLabel = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'Not set';
  }

  return normalized
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatAmount = (amountMicros: number, currencyCode = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountMicros / 1_000_000);

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'No gifts yet';
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(parsed);
};

const getGiftYear = (giftDate: string | null | undefined) => {
  const normalized = normalizeString(giftDate);

  if (normalized === '') {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getFullYear();
};

const isCashGift = (gift: FundGiftRecord) =>
  normalizeString(gift.giftType).toUpperCase() !== 'GIFT_IN_KIND';

const loadFundSummary = async (
  recordId: string,
): Promise<FundSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    fund: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      code: true,
      restrictionType: true,
      isActive: true,
      externalAccountingCode: true,
    },
  } as any);

  return (result?.fund as FundSummaryRecord | null) ?? null;
};

const loadFundGifts = async (fundId: string): Promise<FundGiftRecord[]> => {
  const client = new CoreApiClient();
  const gifts: FundGiftRecord[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;

  while (hasNextPage) {
    const result = await client.query({
      gifts: {
        __args: {
          first: GIFT_PAGE_SIZE,
          ...(cursor ? { after: cursor } : {}),
          filter: {
            fundId: { eq: fundId },
          },
        },
        edges: {
          node: {
            id: true,
            giftDate: true,
            giftType: true,
            amount: {
              amountMicros: true,
              currencyCode: true,
            },
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    } as any);

    gifts.push(...extractConnectionNodes<FundGiftRecord>(result, 'gifts'));

    const pageInfo = (result?.gifts as {
      pageInfo?: {
        hasNextPage?: boolean | null;
        endCursor?: string | null;
      } | null;
    } | null)?.pageInfo;

    hasNextPage = pageInfo?.hasNextPage === true;
    cursor =
      typeof pageInfo?.endCursor === 'string' ? pageInfo.endCursor : undefined;
  }

  return gifts;
};

const summarizeGifts = (gifts: FundGiftRecord[]): FundGivingSummary => {
  const currentYear = new Date().getFullYear();
  const includedGifts = gifts.filter(isCashGift);
  let latestGiftDate: string | null = null;
  let currencyCode = 'GBP';

  const summary = includedGifts.reduce(
    (accumulator, gift) => {
      const amountMicros = Math.round(gift.amount?.amountMicros ?? 0);
      const giftYear = getGiftYear(gift.giftDate);

      if (normalizeString(gift.amount?.currencyCode) !== '') {
        currencyCode = normalizeString(gift.amount?.currencyCode);
      }

      accumulator.lifetimeMicros += amountMicros;

      if (giftYear === currentYear) {
        accumulator.thisYearMicros += amountMicros;
      }

      if (giftYear === currentYear - 1) {
        accumulator.lastYearMicros += amountMicros;
      }

      const normalizedGiftDate = normalizeString(gift.giftDate);

      if (
        normalizedGiftDate !== '' &&
        (!latestGiftDate ||
          new Date(normalizedGiftDate).getTime() >
            new Date(latestGiftDate).getTime())
      ) {
        latestGiftDate = normalizedGiftDate;
      }

      return accumulator;
    },
    {
      lifetimeMicros: 0,
      thisYearMicros: 0,
      lastYearMicros: 0,
    },
  );

  return {
    ...summary,
    giftCount: includedGifts.length,
    latestGiftDate,
    currencyCode,
  };
};

const FundSummary = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<FundSummaryRecord | null>(null);
  const [givingSummary, setGivingSummary] =
    useState<FundGivingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No fund selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [loadedFund, loadedGifts] = await Promise.all([
          loadFundSummary(recordId),
          loadFundGifts(recordId),
        ]);

        if (!loadedFund) {
          setRecord(null);
          setGivingSummary(null);
          setError('Fund not found');
          return;
        }

        setRecord(loadedFund);
        setGivingSummary(summarizeGifts(loadedGifts));
      } catch (loadError) {
        setRecord(null);
        setGivingSummary(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load fund summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading fund summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record || !givingSummary) {
    return <div style={secondaryTextStyle}>Fund not found.</div>;
  }

  const identityLine = [
    normalizeString(record.code) !== '' ? `Code: ${record.code}` : '',
    formatEnumLabel(record.restrictionType),
    normalizeString(record.externalAccountingCode) !== ''
      ? `Accounting: ${record.externalAccountingCode}`
      : '',
  ]
    .filter((value) => value !== '')
    .join(' · ');

  return (
    <div style={compactWidgetRootStyle}>
      <div style={sectionHeaderStyle}>
        <span style={badgeStyle(record.isActive === false ? 'neutral' : 'success')}>
          {record.isActive === false ? 'Inactive' : 'Active'}
        </span>
      </div>

      <div style={compactValueStyle}>
        {normalizeString(record.name) || 'Untitled fund'}
      </div>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {identityLine || 'No fund reference details set'}
      </div>

      <SummaryStrip>
        <SummaryStripItem
          label="This year"
          value={formatAmount(
            givingSummary.thisYearMicros,
            givingSummary.currencyCode,
          )}
        />
        <SummaryStripItem
          label="Last year"
          value={formatAmount(
            givingSummary.lastYearMicros,
            givingSummary.currencyCode,
          )}
        />
        <SummaryStripItem
          label="Lifetime"
          value={formatAmount(
            givingSummary.lifetimeMicros,
            givingSummary.currencyCode,
          )}
        />
        <SummaryStripItem label="Gift count" value={givingSummary.giftCount} />
        <SummaryStripItem
          label="Latest gift"
          value={formatDate(givingSummary.latestGiftDate)}
        />
      </SummaryStrip>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: FUND_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'fund-summary',
  description: 'Lightweight fund home summary with derived gift totals.',
  component: FundSummary,
});
