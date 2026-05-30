import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  badgeStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';

export const COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'fb455e53-c13d-49d6-8895-602cc9c2b094';

type Address = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
} | null;

type LinksField = {
  primaryLinkUrl?: string | null;
} | null;

type CompanyRecordSummaryRecord = {
  id: string;
  name?: string | null;
  domainName?: LinksField;
  linkedinLink?: LinksField;
  address?: Address;
  people?: {
    edges?: Array<{
      node?: {
        id?: string | null;
      } | null;
    }>;
  } | null;
  gifts?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        giftDate?: string | null;
        amount?: {
          amountMicros?: number | null;
          currencyCode?: string | null;
        } | null;
      } | null;
    }>;
  } | null;
  opportunities?: {
    edges?: Array<{
      node?: {
        id?: string | null;
      } | null;
    }>;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const formatAddressSummary = (address: Address) => {
  if (!address) {
    return 'No address recorded';
  }

  const parts = [
    address.addressStreet1,
    address.addressStreet2,
    address.addressCity,
    address.addressState,
    address.addressPostcode,
    address.addressCountry,
  ]
    .map(normalizeString)
    .filter((value) => value !== '');

  return parts.length === 0 ? 'No address recorded' : parts.join(', ');
};

const formatLinkSummary = (
  link: LinksField,
  fallback: string,
) => {
  const url = normalizeString(link?.primaryLinkUrl);

  if (url === '') {
    return fallback;
  }

  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'No gifts linked';
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

const formatGiftTotal = (
  gifts: CompanyRecordSummaryRecord['gifts'],
) => {
  const nodes =
    gifts?.edges
      ?.map((edge) => edge.node)
      .filter((node) => normalizeString(node?.id) !== '') ?? [];

  if (nodes.length === 0) {
    return 'No gifts linked';
  }

  const giftAmounts = nodes
    .map((node) => node?.amount)
    .filter(
      (amount): amount is NonNullable<typeof amount> =>
        amount !== null && typeof amount === 'object',
    );

  if (giftAmounts.length === 0) {
    return `${nodes.length} linked gift${nodes.length === 1 ? '' : 's'}`;
  }

  const currencies = Array.from(
    new Set(
      giftAmounts
        .map((amount) => normalizeString(amount.currencyCode))
        .filter((currency) => currency !== ''),
    ),
  );

  if (currencies.length !== 1) {
    return `${nodes.length} linked gift${nodes.length === 1 ? '' : 's'}`;
  }

  const totalMicros = giftAmounts.reduce(
    (sum, amount) =>
      sum + (typeof amount.amountMicros === 'number' ? amount.amountMicros : 0),
    0,
  );

  return `${currencies[0]} ${(totalMicros / 1_000_000).toFixed(2)}`;
};

const loadCompany = async (
  recordId: string,
): Promise<CompanyRecordSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    company: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      domainName: {
        primaryLinkUrl: true,
      },
      linkedinLink: {
        primaryLinkUrl: true,
      },
      address: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      people: {
        __args: {
          first: 25,
        },
        edges: {
          node: {
            id: true,
          },
        },
      },
      gifts: {
        __args: {
          first: 25,
        },
        edges: {
          node: {
            id: true,
            giftDate: true,
            amount: {
              amountMicros: true,
              currencyCode: true,
            },
          },
        },
      },
      opportunities: {
        __args: {
          first: 25,
        },
        edges: {
          node: {
            id: true,
          },
        },
      },
    },
  } as any);

  return (result?.company as CompanyRecordSummaryRecord | null) ?? null;
};

const CompanyRecordSummary = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<CompanyRecordSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setRecord(null);
        setError('No company selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadCompany(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Company not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load company summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading company summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Company not found.</div>;
  }

  const peopleCount =
    record.people?.edges?.filter((edge) => normalizeString(edge.node?.id) !== '')
      .length ?? 0;
  const giftNodes =
    record.gifts?.edges
      ?.map((edge) => edge.node)
      .filter((node) => normalizeString(node?.id) !== '') ?? [];
  const giftCount = giftNodes.length;
  const opportunityCount =
    record.opportunities?.edges?.filter(
      (edge) => normalizeString(edge.node?.id) !== '',
    ).length ?? 0;
  const hasFundraisingContext = giftCount > 0 || opportunityCount > 0;
  const latestGiftDate = giftNodes
    .map((gift) => normalizeString(gift?.giftDate))
    .filter((value) => value !== '')
    .sort()
    .reverse()[0];

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(hasFundraisingContext ? 'success' : 'neutral')}>
        {hasFundraisingContext ? 'Fundraising context' : 'Company summary'}
      </span>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {normalizeString(record.name) || 'Company record'}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Website</div>
          <div style={compactValueStyle}>
            {formatLinkSummary(record.domainName, 'No website recorded')}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>People</div>
          <div style={compactValueStyle}>
            {peopleCount === 0
              ? 'No people linked'
              : `${peopleCount} linked contact${peopleCount === 1 ? '' : 's'}`}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Address</div>
          <div style={compactValueStyle}>
            {formatAddressSummary(record.address ?? null)}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>LinkedIn</div>
          <div style={compactValueStyle}>
            {formatLinkSummary(record.linkedinLink, 'No LinkedIn recorded')}
          </div>
        </div>
      </div>

      {hasFundraisingContext ? (
        <div style={compactDividerSectionStyle}>
          <div style={labelStyle}>Fundraising context</div>
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Linked giving</div>
              <div style={compactValueStyle}>{formatGiftTotal(record.gifts)}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Gift count</div>
              <div style={compactValueStyle}>{giftCount}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Last gift</div>
              <div style={compactValueStyle}>{formatDate(latestGiftDate)}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Opportunities</div>
              <div style={compactValueStyle}>
                {opportunityCount === 0
                  ? 'No opportunities linked'
                  : `${opportunityCount} linked opportunit${opportunityCount === 1 ? 'y' : 'ies'}`}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: COMPANY_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'company-record-summary',
  description:
    'General company summary with conditional fundraising context for donor-admin workflows.',
  component: CompanyRecordSummary,
});
