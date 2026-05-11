import { useEffect, useState, type CSSProperties } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactValueStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/gift-staging-review-ui';

export const GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'e16aaf4a-97cd-488b-a19e-73635165ad1f';

type GiftGiftAidDeclarationRecord = {
  id: string;
  giftAidDeclaration?: {
    id?: string | null;
    name?: string | null;
    status?: string | null;
    statusReason?: string | null;
    declarationDate?: string | null;
    coverageScope?: string | null;
    source?: string | null;
    textVersion?: string | null;
    revokedAt?: string | null;
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

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value: string | null | undefined) => {
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
  }).format(parsed);
};

const formatStatusLabel = (value: string | null | undefined) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return 'No declaration linked';
  }

  return toTitleCase(normalized);
};

const getIssueLabel = (
  declaration: GiftGiftAidDeclarationRecord['giftAidDeclaration'],
) => {
  if (!declaration?.id) {
    return 'No declaration linked';
  }

  const status = normalizeString(declaration.status).toUpperCase();
  const reason = normalizeString(declaration.statusReason);

  if (status === 'INSUFFICIENT') {
    return reason === ''
      ? 'Declaration needs review'
      : `Declaration needs review: ${toTitleCase(reason)}`;
  }

  if (status === 'REVOKED') {
    return 'Declaration revoked';
  }

  if (status === 'SUPERSEDED') {
    return 'Declaration superseded';
  }

  return 'Declaration linked and active';
};

const getStatusStyle = (value: string | null | undefined): CSSProperties => {
  switch (normalizeString(value).toUpperCase()) {
    case 'ACTIVE':
      return {
        ...statusPillBaseStyle,
        background: '#eef9f0',
        color: '#1a7f37',
      };
    case 'INSUFFICIENT':
      return {
        ...statusPillBaseStyle,
        background: '#fff8c5',
        color: '#7c5d00',
      };
    case 'REVOKED':
      return {
        ...statusPillBaseStyle,
        background: '#fff5f5',
        color: '#8a2d2d',
      };
    case 'SUPERSEDED':
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

const getDeclarationMessage = (
  declaration: GiftGiftAidDeclarationRecord['giftAidDeclaration'],
) => {
  if (!declaration?.id) {
    return 'No declaration is currently linked to this gift.';
  }

  const status = normalizeString(declaration.status).toUpperCase();

  if (status === 'ACTIVE') {
    return 'This declaration is currently usable declaration context for Gift Aid review.';
  }

  if (status === 'INSUFFICIENT') {
    return 'Open the declaration record to review and correct declaration-specific issues.';
  }

  if (status === 'REVOKED') {
    return 'Open the declaration record to review the revocation and whether a different declaration should be used.';
  }

  if (status === 'SUPERSEDED') {
    return 'Open the declaration record to review the newer declaration that superseded this one.';
  }

  return 'Open the declaration record if you need to review its status in more detail.';
};

const loadGift = async (
  recordId: string,
): Promise<GiftGiftAidDeclarationRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      giftAidDeclaration: {
        id: true,
        name: true,
        status: true,
        statusReason: true,
        declarationDate: true,
        coverageScope: true,
        source: true,
        textVersion: true,
        revokedAt: true,
      },
    },
  } as any);

  return (result?.gift as GiftGiftAidDeclarationRecord | null) ?? null;
};

const GiftGiftAidDeclaration = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<GiftGiftAidDeclarationRecord | null>(
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
            : 'Unable to load Gift Aid declaration',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={textStyle}>Loading Gift Aid declaration...</div>;
  }

  if (error) {
    return <div style={textStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={textStyle}>Gift not found.</div>;
  }

  const declaration = record.giftAidDeclaration;
  const declarationName = normalizeString(declaration?.name);

  return (
    <div style={compactWidgetRootStyle}>
      <div style={valueStyle}>
        {declarationName === '' ? 'No linked declaration' : declarationName}
      </div>
      <div style={getStatusStyle(declaration?.status)}>
        {formatStatusLabel(declaration?.status)}
      </div>
      <div style={textStyle}>{getIssueLabel(declaration)}</div>
      <div style={textStyle}>{getDeclarationMessage(declaration)}</div>
      {declaration?.id ? (
        <div style={compactDividerSectionStyle}>
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Declaration date</div>
              <div style={textStyle}>{formatDate(declaration.declarationDate)}</div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Coverage scope</div>
              <div style={textStyle}>
                {normalizeString(declaration.coverageScope) === ''
                  ? 'Not recorded'
                  : toTitleCase(normalizeString(declaration.coverageScope))}
              </div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Source</div>
              <div style={textStyle}>
                {normalizeString(declaration.source) === ''
                  ? 'Not recorded'
                  : declaration.source}
              </div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Text version</div>
              <div style={textStyle}>
                {normalizeString(declaration.textVersion) === ''
                  ? 'Not recorded'
                  : declaration.textVersion}
              </div>
            </div>
            {normalizeString(declaration.revokedAt) !== '' ? (
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Revoked</div>
                <div style={textStyle}>{formatDate(declaration.revokedAt)}</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  name: 'Gift Gift Aid Declaration',
  universalIdentifier:
    GIFT_GIFT_AID_DECLARATION_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  description: 'Declaration context summary for a gift Gift Aid review tab.',
  component: GiftGiftAidDeclaration,
});
