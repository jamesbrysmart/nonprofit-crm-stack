import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  compactConfirmationCardStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  labelStyle,
  secondaryTextStyle,
} from 'src/front-components/front-component-ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'daa7d7bb-d8ca-471c-b219-3ea699657c5b';

const renderValue = (value: string) => {
  return value === '' ? 'Not recorded' : value;
};

const auditValueStyle = {
  ...secondaryTextStyle,
  color: '#1f2328',
};

const sectionTitleStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1f2328',
  lineHeight: 1.4,
};

const hasValue = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() !== '';

const humanizeEnum = (value: string) => {
  if (!hasValue(value)) {
    return 'Not recorded';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const GiftStagingAudit = () => {
  const recordId = useRecordId();
  const { record, loading, error } = useGiftStagingReviewRecord(recordId);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading audit view...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!record) {
    return <div style={secondaryTextStyle}>Staging row not found.</div>;
  }

  const sourceEvidenceItems = [
    {
      label: 'Intake source',
      value: record.intakeSource,
      alwaysShow: true,
    },
    {
      label: 'Provider',
      value: record.provider,
      alwaysShow: true,
    },
    {
      label: 'External ID',
      value: record.externalId,
    },
    {
      label: 'Provider payment ID',
      value: record.providerPaymentId,
    },
    {
      label: 'Provider agreement ID',
      value: record.providerAgreementId,
    },
    {
      label: 'Source fingerprint',
      value: record.sourceFingerprint,
    },
  ].filter((item) => item.alwaysShow === true || hasValue(item.value));

  const recurringEvidenceItems = [
    {
      label: 'Provider interval unit',
      value: record.providerIntervalUnit,
    },
    {
      label: 'Provider interval count',
      value:
        record.providerIntervalCount === null
          ? ''
          : String(record.providerIntervalCount),
    },
  ].filter((item) => hasValue(item.value));

  const hasGiftAidEvidence =
    isGiftAidEnabled() &&
    (record.giftAidRequested ||
      record.giftAidDeclarationCaptured ||
      hasValue(record.giftAidDeclarationDate) ||
      hasValue(record.giftAidCoverageScope) ||
      hasValue(record.giftAidDeclarationSource) ||
      hasValue(record.giftAidTextVersion) ||
      hasValue(record.giftAidDeclarationId));

  return (
    <div style={compactWidgetRootStyle}>
      <div style={compactConfirmationCardStyle}>
        <div style={sectionTitleStyle}>Source and provider evidence</div>
        <div style={compactMetaGridStyle}>
          {sourceEvidenceItems.map((item) => (
            <div key={item.label} style={compactMetaItemStyle}>
              <div style={labelStyle}>{item.label}</div>
              <div style={auditValueStyle}>{renderValue(item.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={compactConfirmationCardStyle}>
          <div style={sectionTitleStyle}>Processing diagnostics</div>
          {record.errorDetail !== '' ? (
            <div style={{ display: 'grid', gap: '4px' }}>
              <div style={labelStyle}>Last error</div>
              <div style={{ ...secondaryTextStyle, color: '#b42318' }}>
                {record.errorDetail}
              </div>
            </div>
          ) : null}
          <div style={compactMetaGridStyle}>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Processing status</div>
              <div style={auditValueStyle}>
                {humanizeEnum(record.processingStatus)}
              </div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Ready status</div>
              <div style={auditValueStyle}>
                {humanizeEnum(record.giftReadyStatus)}
              </div>
            </div>
            <div style={compactMetaItemStyle}>
              <div style={labelStyle}>Gift record</div>
              <div style={auditValueStyle}>
                {renderValue(record.committedGiftName)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {recurringEvidenceItems.length > 0 ? (
        <div style={compactDividerSectionStyle}>
          <div style={compactConfirmationCardStyle}>
            <div style={sectionTitleStyle}>Captured evidence</div>
            <div style={compactMetaGridStyle}>
              {recurringEvidenceItems.map((item) => (
                <div key={item.label} style={compactMetaItemStyle}>
                  <div style={labelStyle}>{item.label}</div>
                  <div style={auditValueStyle}>{renderValue(item.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {hasGiftAidEvidence ? (
        <div style={compactDividerSectionStyle}>
          <div style={compactConfirmationCardStyle}>
            <div style={sectionTitleStyle}>Gift Aid evidence</div>
            <div style={secondaryTextStyle}>
              {record.giftAidRequested
                ? 'Gift Aid was requested on this staged row.'
                : 'Gift Aid evidence is recorded on this staged row.'}
            </div>
            <div style={compactMetaGridStyle}>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Declaration captured</div>
                <div style={auditValueStyle}>
                  {record.giftAidDeclarationCaptured ? 'Yes' : 'No'}
                </div>
              </div>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Declaration date</div>
                <div style={auditValueStyle}>
                  {renderValue(record.giftAidDeclarationDate)}
                </div>
              </div>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Coverage scope</div>
                <div style={auditValueStyle}>
                  {renderValue(record.giftAidCoverageScope)}
                </div>
              </div>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Declaration source</div>
                <div style={auditValueStyle}>
                  {renderValue(record.giftAidDeclarationSource)}
                </div>
              </div>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Text version</div>
                <div style={auditValueStyle}>
                  {renderValue(record.giftAidTextVersion)}
                </div>
              </div>
              <div style={compactMetaItemStyle}>
                <div style={labelStyle}>Linked declaration</div>
                <div style={auditValueStyle}>
                  {renderValue(record.giftAidDeclarationId)}
                </div>
              </div>
            </div>
            <div style={secondaryTextStyle}>
              Gift Aid outcome still belongs on the final gift record. This
              tab is for captured evidence and support review.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'gift-staging-record-audit',
  description:
    'Audit and provider evidence surface for a staged gift record.',
  component: GiftStagingAudit,
});
