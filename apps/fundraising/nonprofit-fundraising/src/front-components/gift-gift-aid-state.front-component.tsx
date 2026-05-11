import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import { subscribeToGiftRecordInvalidated } from 'src/gift-record/gift-record-sync';
import {
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';

export const GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '867a2364-6eaa-4ef6-a7d3-85759e0e9b93';

type GiftAidGiftRecord = {
  id: string;
  name?: string | null;
  donorFirstName?: string | null;
  donorLastName?: string | null;
  giftAidStatus?: string | null;
  giftAidReasonCode?: string | null;
  giftAidDecisionSource?: string | null;
  giftAidLastEvaluatedAt?: string | null;
  giftAidDeclaration?: {
    id?: string | null;
    name?: string | null;
    status?: string | null;
    declarationDate?: string | null;
    coverageScope?: string | null;
    source?: string | null;
  } | null;
};

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

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusLabel = (status: string | null | undefined) => {
  switch (normalizeString(status).toUpperCase()) {
    case 'CLAIMABLE':
      return 'Claimable';
    case 'NEEDS_REVIEW':
      return 'Needs review';
    case 'NOT_CLAIMABLE':
      return 'Not claimable';
    default:
      return 'Not assessed';
  }
};

const getStatusStyle = (status: string | null | undefined): CSSProperties => {
  switch (normalizeString(status).toUpperCase()) {
    case 'CLAIMABLE':
      return {
        ...statusPillBaseStyle,
        background: '#eef9f0',
        color: '#1a7f37',
      };
    case 'NEEDS_REVIEW':
      return {
        ...statusPillBaseStyle,
        background: '#fff8c5',
        color: '#7c5d00',
      };
    case 'NOT_CLAIMABLE':
      return {
        ...statusPillBaseStyle,
        background: '#f6f8fa',
        color: '#57606a',
      };
    default:
      return {
        ...statusPillBaseStyle,
        background: '#f6f8fa',
        color: '#57606a',
      };
  }
};

const getReasonLabel = (reason: string | null | undefined) => {
  const normalized = normalizeString(reason);
  if (normalized === '') {
    return 'No reason recorded';
  }

  switch (normalized) {
    case 'valid_declaration_present':
      return 'Valid declaration present';
    case 'no_declaration_on_file':
      return 'No declaration on file';
    case 'donor_data_incomplete':
      return 'Donor details incomplete';
    case 'declaration_insufficient':
      return 'Declaration insufficient';
    case 'declaration_donor_mismatch':
      return 'Declaration donor mismatch';
    case 'non_individual_donor':
      return 'Non-individual donor';
    case 'gift_refunded_or_reversed':
      return 'Gift refunded or reversed';
    case 'not_requested':
      return 'Gift Aid not requested';
    default:
      return toTitleCase(normalized);
  }
};

const getNextAction = (record: GiftAidGiftRecord) => {
  const status = normalizeString(record.giftAidStatus).toUpperCase();
  const reason = normalizeString(record.giftAidReasonCode);

  if (status === 'CLAIMABLE') {
    return 'No Gift Aid follow-up is currently required for this gift.';
  }

  if (reason === 'no_declaration_on_file') {
    return 'Capture or link a usable declaration, then review the gift again.';
  }

  if (
    reason === 'donor_data_incomplete' ||
    reason === 'declaration_insufficient'
  ) {
    return 'Review the donor and declaration context before treating this gift as claimable.';
  }

  if (reason === 'declaration_donor_mismatch') {
    return 'Check the linked donor and declaration before continuing.';
  }

  if (reason === 'non_individual_donor') {
    return 'This gift should remain outside Gift Aid claim preparation.';
  }

  if (reason === 'gift_refunded_or_reversed') {
    return 'This gift has a recorded refund or reversal state and should remain outside Gift Aid claim preparation.';
  }

  if (reason === 'not_requested') {
    return 'No Gift Aid action is needed unless the intake evidence changes.';
  }

  return 'Review the Gift Aid context for this gift before continuing.';
};

const formatDateTime = (value: string | null | undefined) => {
  const normalized = normalizeString(value);
  if (normalized === '') {
    return 'Not recorded';
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const loadGift = async (recordId: string): Promise<GiftAidGiftRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      giftAidStatus: true,
      giftAidReasonCode: true,
      giftAidDecisionSource: true,
      giftAidLastEvaluatedAt: true,
      giftAidDeclaration: {
        id: true,
        name: true,
        status: true,
        declarationDate: true,
        coverageScope: true,
        source: true,
      },
    },
  } as any);

  return (result?.gift as GiftAidGiftRecord | null) ?? null;
};

const GiftGiftAidState = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftAidGiftRecord | null>(null);
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
            : 'Unable to load Gift Aid state',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return;
    }

    return subscribeToGiftRecordInvalidated({
      recordId,
      onInvalidate: async () => {
        const loaded = await loadGift(recordId);

        if (!loaded) {
          return;
        }

        setRecord(loaded);
      },
    });
  }, [recordId]);

  if (loading) {
    return <div style={textStyle}>Loading Gift Aid state...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={textStyle}>Gift not found.</div>;
  }

  const statusLabel = getStatusLabel(record.giftAidStatus);
  const reasonLabel = getReasonLabel(record.giftAidReasonCode);
  const nextAction = getNextAction(record);
  const decisionSource = normalizeString(record.giftAidDecisionSource);
  const declarationName =
    normalizeString(record.giftAidDeclaration?.name) ||
    normalizeString(record.giftAidDeclaration?.id) ||
    'Not linked';

  return (
    <div style={compactWidgetRootStyle}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <div style={getStatusStyle(record.giftAidStatus)}>{statusLabel}</div>
        <div style={textStyle}>{reasonLabel}</div>
      </div>
      <div style={compactValueStyle}>{nextAction}</div>

      <div style={compactDividerSectionStyle}>
        <div style={compactMetaGridStyle}>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Decision source</div>
            <div style={textStyle}>
              {decisionSource === '' ? 'Not recorded' : toTitleCase(decisionSource)}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Last checked</div>
            <div style={textStyle}>
              {formatDateTime(record.giftAidLastEvaluatedAt)}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Declaration</div>
            <div style={textStyle}>{declarationName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  name: 'Gift Gift Aid State',
  universalIdentifier: GIFT_GIFT_AID_STATE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  description: 'Operational Gift Aid state summary for a final gift record.',
  component: GiftGiftAidState,
});
