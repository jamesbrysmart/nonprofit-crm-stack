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
} from 'src/front-components/front-component-ui';

export const PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '1e1c6282-b236-4e3e-ac0d-c6f495fc4476';

type MailingAddress = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
} | null;

type PersonRecordSummaryRecord = {
  id: string;
  name?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  emails?: {
    primaryEmail?: string | null;
  } | null;
  phones?: {
    primaryPhoneCallingCode?: string | null;
    primaryPhoneNumber?: string | null;
  } | null;
  company?: {
    id?: string | null;
    name?: string | null;
  } | null;
  mailingAddress?: MailingAddress;
  lifetimeGiftAmount?: {
    amountMicros?: number | null;
    currencyCode?: string | null;
  } | null;
  lifetimeGiftCount?: number | null;
  lastGiftDate?: string | null;
  recurringAgreements?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        status?: string | null;
      } | null;
    }>;
  } | null;
  giftAidDeclarations?: {
    edges?: Array<{
      node?: {
        id?: string | null;
        status?: string | null;
        revokedAt?: string | null;
      } | null;
    }>;
  } | null;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const buildDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
) => {
  const fullName = `${normalizeString(firstName)} ${normalizeString(lastName)}`.trim();
  return fullName === '' ? 'Person record' : fullName;
};

const formatAddressSummary = (mailingAddress: MailingAddress) => {
  if (!mailingAddress) {
    return 'No mailing address recorded';
  }

  const parts = [
    mailingAddress.addressStreet1,
    mailingAddress.addressStreet2,
    mailingAddress.addressCity,
    mailingAddress.addressState,
    mailingAddress.addressPostcode,
    mailingAddress.addressCountry,
  ]
    .map(normalizeString)
    .filter((value) => value !== '');

  return parts.length === 0 ? 'No mailing address recorded' : parts.join(', ');
};

const formatPhoneSummary = (
  phones: PersonRecordSummaryRecord['phones'],
) => {
  const callingCode = normalizeString(phones?.primaryPhoneCallingCode);
  const phoneNumber = normalizeString(phones?.primaryPhoneNumber);

  if (phoneNumber === '') {
    return 'No phone number recorded';
  }

  return `${callingCode} ${phoneNumber}`.trim();
};

const formatCurrencyAmount = (
  amount: PersonRecordSummaryRecord['lifetimeGiftAmount'],
) => {
  const micros = amount?.amountMicros;
  const currency = normalizeString(amount?.currencyCode) || 'GBP';

  if (typeof micros !== 'number') {
    return 'No gifts recorded';
  }

  return `${currency} ${(micros / 1_000_000).toFixed(2)}`;
};

const formatDate = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'No recent gift recorded';
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

const loadPerson = async (
  recordId: string,
): Promise<PersonRecordSummaryRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    person: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: {
        firstName: true,
        lastName: true,
      },
      emails: {
        primaryEmail: true,
      },
      phones: {
        primaryPhoneCallingCode: true,
        primaryPhoneNumber: true,
      },
      company: {
        id: true,
        name: true,
      },
      mailingAddress: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      lifetimeGiftAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      lifetimeGiftCount: true,
      lastGiftDate: true,
      recurringAgreements: {
        __args: {
          first: 5,
        },
        edges: {
          node: {
            id: true,
            status: true,
          },
        },
      },
      giftAidDeclarations: {
        __args: {
          first: 5,
        },
        edges: {
          node: {
            id: true,
            status: true,
            revokedAt: true,
          },
        },
      },
    },
  } as any);

  return (result?.person as PersonRecordSummaryRecord | null) ?? null;
};

const PersonRecordSummary = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<PersonRecordSummaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setRecord(null);
        setError('No person selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadPerson(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Person not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load person summary',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading person summary...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Person not found.</div>;
  }

  const recurringCount = record.recurringAgreements?.edges?.filter(
    (edge) => normalizeString(edge.node?.id) !== '',
  ).length ?? 0;
  const declarationCount = record.giftAidDeclarations?.edges?.filter(
    (edge) => normalizeString(edge.node?.id) !== '',
  ).length ?? 0;
  const activeDeclarationCount = record.giftAidDeclarations?.edges?.filter(
    (edge) => normalizeString(edge.node?.status).toUpperCase() === 'ACTIVE',
  ).length ?? 0;
  const lifetimeGiftCount =
    typeof record.lifetimeGiftCount === 'number' ? record.lifetimeGiftCount : 0;
  const hasFundraisingContext =
    lifetimeGiftCount > 0 || recurringCount > 0 || declarationCount > 0;

  const companyName = normalizeString(record.company?.name);
  const primaryEmail = normalizeString(record.emails?.primaryEmail);

  return (
    <div style={compactWidgetRootStyle}>
      <span style={badgeStyle(hasFundraisingContext ? 'success' : 'neutral')}>
        {hasFundraisingContext ? 'Fundraising context' : 'Person summary'}
      </span>

      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        {buildDisplayName(record.name?.firstName, record.name?.lastName)}
      </div>

      <div style={compactMetaGridStyle}>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Email</div>
          <div style={compactValueStyle}>
            {primaryEmail === '' ? 'No email recorded' : primaryEmail}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Phone</div>
          <div style={compactValueStyle}>{formatPhoneSummary(record.phones)}</div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Company</div>
          <div style={compactValueStyle}>
            {companyName === '' ? 'No company linked' : companyName}
          </div>
        </div>
        <div style={compactMetaItemStyle}>
          <div style={labelStyle}>Mailing address</div>
          <div style={compactValueStyle}>
            {formatAddressSummary(record.mailingAddress ?? null)}
          </div>
        </div>
      </div>

      {hasFundraisingContext ? (
        <div style={compactDividerSectionStyle}>
          <div style={labelStyle}>Fundraising context</div>
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Lifetime giving</div>
              <div style={compactValueStyle}>
                {formatCurrencyAmount(record.lifetimeGiftAmount)}
              </div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Gift count</div>
              <div style={compactValueStyle}>{lifetimeGiftCount}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Last gift</div>
              <div style={compactValueStyle}>{formatDate(record.lastGiftDate)}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Recurring agreements</div>
              <div style={compactValueStyle}>{recurringCount}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Gift Aid</div>
              <div style={compactValueStyle}>
                {declarationCount === 0
                  ? 'No declarations recorded'
                  : activeDeclarationCount > 0
                    ? `${activeDeclarationCount} active declaration${activeDeclarationCount === 1 ? '' : 's'}`
                    : `${declarationCount} declaration${declarationCount === 1 ? '' : 's'} recorded`}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: PERSON_RECORD_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'person-record-summary',
  description:
    'General person summary with conditional fundraising context for donor-admin workflows.',
  component: PersonRecordSummary,
});
