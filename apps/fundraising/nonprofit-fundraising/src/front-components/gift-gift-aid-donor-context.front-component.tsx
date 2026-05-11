import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';

export const GIFT_GIFT_AID_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '2f9473b3-b340-492f-914f-9224e8616f5d';

type MailingAddress = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
} | null;

type GiftGiftAidDonorContextRecord = {
  id: string;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  donorEmail?: string | null;
  giftAidReasonCode?: string | null;
  donor?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    emails?: {
      primaryEmail?: string | null;
    } | null;
    mailingAddress?: MailingAddress;
  } | null;
};

const valueStyle: CSSProperties = compactValueStyle;
const textStyle: CSSProperties = secondaryTextStyle;

const statusPillBaseStyle: CSSProperties = {
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  width: 'fit-content',
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const buildDisplayName = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback: string,
) => {
  const fullName = `${normalizeString(firstName)} ${normalizeString(lastName)}`.trim();
  return fullName === '' ? fallback : fullName;
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

const hasUsableAddress = (mailingAddress: MailingAddress) => {
  if (!mailingAddress) {
    return false;
  }

  return (
    normalizeString(mailingAddress.addressStreet1) !== '' &&
    normalizeString(mailingAddress.addressCity) !== '' &&
    normalizeString(mailingAddress.addressPostcode) !== '' &&
    normalizeString(mailingAddress.addressCountry) !== ''
  );
};

const getStatusStyle = (
  tone: 'success' | 'warning' | 'neutral',
): CSSProperties => {
  switch (tone) {
    case 'success':
      return {
        ...statusPillBaseStyle,
        background: '#eef9f0',
        color: '#1a7f37',
      };
    case 'warning':
      return {
        ...statusPillBaseStyle,
        background: '#fff8c5',
        color: '#7c5d00',
      };
    default:
      return {
        ...statusPillBaseStyle,
        background: '#f6f8fa',
        color: '#57606a',
      };
  }
};

const getIssue = (record: GiftGiftAidDonorContextRecord) => {
  if (!record.donor?.id) {
    return {
      label: 'No donor linked',
      tone: 'warning' as const,
      message: 'Link the donor before relying on donor details for Gift Aid.',
    };
  }

  if (normalizeString(record.giftAidReasonCode) === 'declaration_donor_mismatch') {
    return {
      label: 'Donor context needs review',
      tone: 'warning' as const,
      message:
        'The linked donor does not match the declaration. Review the donor before continuing.',
    };
  }

  if (!hasUsableAddress(record.donor.mailingAddress ?? null)) {
    return {
      label: 'Mailing address incomplete',
      tone: 'warning' as const,
      message:
        'The linked donor is present, but the mailing address still looks incomplete for Gift Aid.',
    };
  }

  return {
    label: 'Donor context linked',
    tone: 'success' as const,
    message:
      'A linked donor and mailing address are present. Any remaining Gift Aid issue is likely elsewhere.',
  };
};

const loadGift = async (
  recordId: string,
): Promise<GiftGiftAidDonorContextRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      giftAidReasonCode: true,
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
        mailingAddress: {
          addressStreet1: true,
          addressStreet2: true,
          addressCity: true,
          addressState: true,
          addressPostcode: true,
          addressCountry: true,
        },
      },
    },
  } as any);

  return (result?.gift as GiftGiftAidDonorContextRecord | null) ?? null;
};

const GiftGiftAidDonorContext = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftGiftAidDonorContextRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setError('No gift selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const loaded = await loadGift(recordId);

        if (!loaded) {
          setRecord(null);
          setError('Gift not found');
          return;
        }

        setRecord(loaded);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load donor context',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={textStyle}>Loading donor context...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={textStyle}>Gift not found.</div>;
  }

  const linkedDonor = record.donor;
  const linkedDonorName = linkedDonor?.id
    ? buildDisplayName(
        linkedDonor.name?.firstName,
        linkedDonor.name?.lastName,
        'Linked donor',
      )
    : 'No linked donor';
  const donorEvidenceName = buildDisplayName(
    record.donorFirstName,
    record.donorLastName,
    normalizeString(record.donorEmail) === ''
      ? 'No donor evidence recorded'
      : normalizeString(record.donorEmail),
  );
  const linkedDonorEmail = normalizeString(linkedDonor?.emails?.primaryEmail);
  const issue = getIssue(record);

  const handleGoToDonor = async () => {
    if (!linkedDonor?.id) {
      return;
    }

    await navigate(AppPath.RecordShowPage, {
      objectNameSingular: 'person',
      objectRecordId: linkedDonor.id,
    });
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={valueStyle}>{linkedDonorName}</div>
      <div style={getStatusStyle(issue.tone)}>{issue.label}</div>
      <div style={textStyle}>{issue.message}</div>
      <div style={compactDividerSectionStyle}>
        <div style={compactMetaGridStyle}>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Gift details captured</div>
            <div style={textStyle}>{donorEvidenceName}</div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Donor email</div>
            <div style={textStyle}>
              {linkedDonorEmail === '' ? 'Not recorded' : linkedDonorEmail}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Mailing address</div>
            <div style={textStyle}>
              {formatAddressSummary(linkedDonor?.mailingAddress ?? null)}
            </div>
          </div>
        </div>
      </div>
      {linkedDonor?.id ? (
        <div>
          <Button
            title="Open donor"
            variant="secondary"
            onClick={() => {
              void handleGoToDonor();
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    GIFT_GIFT_AID_DONOR_CONTEXT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-gift-aid-donor-context',
  description: 'Linked donor and mailing-address context for Gift Aid review.',
  component: GiftGiftAidDonorContext,
});
