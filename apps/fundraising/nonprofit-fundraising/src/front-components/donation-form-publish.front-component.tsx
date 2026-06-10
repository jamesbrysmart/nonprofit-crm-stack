import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { publishDonationForm } from 'src/donation-forms/donation-form-publish.api';
import { DEFAULT_STRIPE_PROVIDER_CONFIG_KEY } from 'src/donation-forms/donation-form-checkout-stripe';
import {
  badgeStyle,
  labelStyle,
  panelStackStyle,
  secondaryTextStyle,
  sectionHeaderStyle,
  valueStyle,
} from 'src/front-components/front-component-ui';
import {
  compactMetaGridStyle,
  derivePublishedState,
  embedCodeStyle,
  formatPublishedAt,
  linkStyle,
  normalizeConfig,
  normalizeString,
  panelStyle,
  stableStringify,
  type PublishedState,
  useDonationFormRecord,
} from 'src/front-components/donation-form-workspace.shared';

export const DONATION_FORM_PUBLISH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '58f5ba8f-6660-45bd-8387-ca59a779f6b7';

const DonationFormPublish = () => {
  const recordId = useRecordId();
  const { record, setRecord, loading, error } = useDonationFormRecord(recordId);
  const [publishing, setPublishing] = useState(false);
  const [publishedState, setPublishedState] = useState<PublishedState | null>(null);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading donation form publishing…</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Donation form not found.</div>;
  }

  const effectivePublishedState = derivePublishedState(record, publishedState);
  const draftMatchesPublished =
    stableStringify(normalizeConfig(record.config)) ===
    stableStringify(normalizeConfig(record.publishedConfig));
  const stateBadge = effectivePublishedState
    ? draftMatchesPublished
      ? { label: 'Published and in sync', tone: 'success' as const }
      : { label: 'Saved draft not published', tone: 'warning' as const }
    : { label: 'Draft only', tone: 'neutral' as const };
  const publishSummaryLine = effectivePublishedState
    ? draftMatchesPublished
      ? 'The live form matches the current saved draft.'
      : 'A newer saved draft is ready to publish.'
    : 'Publish the saved draft to generate the live form and embed snippet.';
  const paymentProvider = normalizeString(record.paymentProvider) || 'Unknown';
  const providerConfigKey = normalizeString(record.providerConfigKey);
  const effectiveProviderConfigKey =
    paymentProvider === 'STRIPE' && providerConfigKey === ''
      ? `${DEFAULT_STRIPE_PROVIDER_CONFIG_KEY} (default)`
      : providerConfigKey || 'Missing';

  const handlePublish = async () => {
    setPublishing(true);

    try {
      const response = await publishDonationForm({
        donationFormId: recordId,
      });

      setPublishedState({
        publicId: response.publicId,
        publishedVersion: response.publishedVersion,
        iframeUrl: response.iframeUrl,
        embedSnippet: response.embedSnippet,
      });
      setRecord((current) =>
        current
          ? {
              ...current,
              status: response.status,
              publicId: response.publicId,
              publishedVersion: response.publishedVersion,
              publishedAt: new Date().toISOString(),
              publishedConfig: normalizeConfig(current.config),
            }
          : current,
      );

      await enqueueSnackbar({
        message:
          normalizeString(record.status) === 'LIVE'
            ? 'Donation form republished.'
            : 'Donation form published.',
        variant: 'success',
      });
    } catch (publishError) {
      await enqueueSnackbar({
        message:
          publishError instanceof Error
            ? publishError.message
            : 'Unable to publish donation form.',
        variant: 'error',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={panelStackStyle}>
      <div style={panelStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={badgeStyle(stateBadge.tone)}>{stateBadge.label}</div>
            <div style={{ ...valueStyle, fontWeight: 600 }}>
              {publishSummaryLine}
            </div>
            <div style={secondaryTextStyle}>
              Publish controls the live donation form, public link, and iframe
              embed snippet.
            </div>
          </div>
          <Button
            title={
              publishing
                ? 'Publishing…'
                : normalizeString(record.status) === 'LIVE'
                  ? 'Republish form'
                  : 'Publish form'
            }
            variant="primary"
            onClick={() => {
              void handlePublish();
            }}
            disabled={publishing}
          />
        </div>

        <div
          style={{
            ...compactMetaGridStyle,
            gap: '12px',
          }}
        >
          <div style={{ display: 'grid', gap: '4px' }}>
            <span style={labelStyle}>Live status</span>
            <span style={valueStyle}>{normalizeString(record.status) || 'Unknown'}</span>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <span style={labelStyle}>Published at</span>
            <span style={valueStyle}>{formatPublishedAt(record.publishedAt)}</span>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <span style={labelStyle}>Public ID</span>
            <span style={valueStyle}>
              {effectivePublishedState?.publicId || 'Not published yet'}
            </span>
          </div>
          <div style={{ display: 'grid', gap: '4px' }}>
            <span style={labelStyle}>Published version</span>
            <span style={valueStyle}>
              {effectivePublishedState?.publishedVersion || 'Not published yet'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '10px',
          }}
        >
          <div style={labelStyle}>Live form access</div>
          {effectivePublishedState?.iframeUrl ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              <a
                href={effectivePublishedState.iframeUrl}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Open live form
              </a>
              <div style={secondaryTextStyle}>
                Opens the current published donation form in a new tab for live
                testing.
              </div>
            </div>
          ) : (
            <div style={secondaryTextStyle}>
              Publish the form once to generate the live public link.
            </div>
          )}
        </div>

        {effectivePublishedState?.embedSnippet ? (
          <div style={{ display: 'grid', gap: '6px' }}>
            <div style={labelStyle}>Iframe embed snippet</div>
            <pre style={embedCodeStyle}>{effectivePublishedState.embedSnippet}</pre>
          </div>
        ) : (
          <div style={secondaryTextStyle}>
            Publish the form once to generate the iframe embed snippet.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gap: '8px',
            paddingTop: '4px',
          }}
        >
          <div style={labelStyle}>Provider details</div>
          <div
            style={{
              ...compactMetaGridStyle,
              gap: '12px',
            }}
          >
            <div style={{ display: 'grid', gap: '4px' }}>
              <span style={labelStyle}>Payment provider</span>
              <span style={valueStyle}>{paymentProvider}</span>
            </div>
            <div style={{ display: 'grid', gap: '4px' }}>
              <span style={labelStyle}>Provider config key</span>
              <span style={valueStyle}>{effectiveProviderConfigKey}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    DONATION_FORM_PUBLISH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'donation-form-publish',
  description:
    'Donation form publish surface for live status, embed details, and publish actions.',
  component: DonationFormPublish,
});
