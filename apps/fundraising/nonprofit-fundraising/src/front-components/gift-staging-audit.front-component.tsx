import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';
import {
  cardWithLooseGapStyle,
  detailsGridStyle,
  labelStyle,
  panelStackStyle,
  secondaryTextStyle,
  valueStyle,
} from 'src/front-components/gift-staging-review-ui';
import { isGiftAidEnabled } from 'src/gift-aid/gift-aid-config';
import { useGiftStagingReviewRecord } from 'src/gift-staging-review/use-gift-staging-review-record';

export const GIFT_STAGING_AUDIT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'daa7d7bb-d8ca-471c-b219-3ea699657c5b';

const renderValue = (value: string) => {
  return value === '' ? 'Not recorded' : value;
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

  return (
    <div style={panelStackStyle}>
      <div style={cardWithLooseGapStyle}>
        <div style={labelStyle}>Source and provider evidence</div>
        <div style={detailsGridStyle}>
          <div>
            <div style={labelStyle}>Intake source</div>
            <div style={valueStyle}>{renderValue(record.intakeSource)}</div>
          </div>
          <div>
            <div style={labelStyle}>Provider</div>
            <div style={valueStyle}>{renderValue(record.provider)}</div>
          </div>
          <div>
            <div style={labelStyle}>External ID</div>
            <div style={valueStyle}>{renderValue(record.externalId)}</div>
          </div>
          <div>
            <div style={labelStyle}>Source fingerprint</div>
            <div style={valueStyle}>{renderValue(record.sourceFingerprint)}</div>
          </div>
          <div>
            <div style={labelStyle}>Provider payment ID</div>
            <div style={valueStyle}>{renderValue(record.providerPaymentId)}</div>
          </div>
          <div>
            <div style={labelStyle}>Provider agreement ID</div>
            <div style={valueStyle}>
              {renderValue(record.providerAgreementId)}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Provider interval unit</div>
            <div style={valueStyle}>
              {renderValue(record.providerIntervalUnit)}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Provider interval count</div>
            <div style={valueStyle}>
              {record.providerIntervalCount === null
                ? 'Not recorded'
                : String(record.providerIntervalCount)}
            </div>
          </div>
        </div>
      </div>

      <div style={cardWithLooseGapStyle}>
        <div style={labelStyle}>Processing diagnostics</div>
        <div style={detailsGridStyle}>
          <div>
            <div style={labelStyle}>Processing status</div>
            <div style={valueStyle}>{record.processingStatus}</div>
          </div>
          <div>
            <div style={labelStyle}>Marked ready</div>
            <div style={valueStyle}>
              {record.isReadyForProcessing ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Committed gift</div>
            <div style={valueStyle}>{renderValue(record.committedGiftName)}</div>
          </div>
        </div>
        <div>
          <div style={labelStyle}>Last error</div>
          <div style={secondaryTextStyle}>
            {record.errorDetail === ''
              ? 'No processing error has been recorded on this row.'
              : record.errorDetail}
          </div>
        </div>
      </div>

      {isGiftAidEnabled() ? (
        <div style={cardWithLooseGapStyle}>
          <div style={labelStyle}>Gift Aid evidence</div>
          <div style={secondaryTextStyle}>
            {record.giftAidRequested
              ? 'Gift Aid was requested on this staged row.'
              : 'Gift Aid was not requested on this staged row.'}
          </div>
          <div style={detailsGridStyle}>
            <div>
              <div style={labelStyle}>Declaration captured</div>
              <div style={valueStyle}>
                {record.giftAidDeclarationCaptured ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Declaration date</div>
              <div style={valueStyle}>
                {renderValue(record.giftAidDeclarationDate)}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Coverage scope</div>
              <div style={valueStyle}>
                {renderValue(record.giftAidCoverageScope)}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Declaration source</div>
              <div style={valueStyle}>
                {renderValue(record.giftAidDeclarationSource)}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Text version</div>
              <div style={valueStyle}>
                {renderValue(record.giftAidTextVersion)}
              </div>
            </div>
            <div>
              <div style={labelStyle}>Linked declaration</div>
              <div style={valueStyle}>
                {renderValue(record.giftAidDeclarationId)}
              </div>
            </div>
          </div>
          <div style={secondaryTextStyle}>
            Gift Aid outcome still belongs on the final committed gift. This
            tab is for captured evidence and support review.
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
