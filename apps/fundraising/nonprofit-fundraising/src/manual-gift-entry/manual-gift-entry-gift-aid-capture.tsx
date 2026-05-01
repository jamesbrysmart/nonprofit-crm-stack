import type { CSSProperties } from 'react';

type ManualGiftEntryGiftAidCaptureProps = {
  giftAidRequested: boolean;
  giftAidDeclarationCaptured: boolean;
  giftAidDeclarationDate: string;
  giftAidCoverageScope: string;
  giftAidDeclarationSource: string;
  giftAidTextVersion: string;
  onGiftAidRequestedChange: (value: boolean) => void;
  onGiftAidDeclarationCapturedChange: (value: boolean) => void;
  onGiftAidDeclarationDateChange: (value: string) => void;
  onGiftAidCoverageScopeChange: (value: string) => void;
  onGiftAidDeclarationSourceChange: (value: string) => void;
  onGiftAidTextVersionChange: (value: string) => void;
};

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: '#ffffff',
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const sectionTitleStyle: CSSProperties = {
  ...labelStyle,
  color: '#1f2328',
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: '#57606a',
  lineHeight: 1.5,
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  return '';
};

const getInputEventChecked = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'checked' in event.detail
  ) {
    return Boolean(event.detail.checked);
  }

  return false;
};

export const ManualGiftEntryGiftAidCapture = ({
  giftAidRequested,
  giftAidDeclarationCaptured,
  giftAidDeclarationDate,
  giftAidCoverageScope,
  giftAidDeclarationSource,
  giftAidTextVersion,
  onGiftAidRequestedChange,
  onGiftAidDeclarationCapturedChange,
  onGiftAidDeclarationDateChange,
  onGiftAidCoverageScopeChange,
  onGiftAidDeclarationSourceChange,
  onGiftAidTextVersionChange,
}: ManualGiftEntryGiftAidCaptureProps) => {
  return (
    <div style={cardStyle}>
      <div style={sectionTitleStyle}>Gift Aid</div>
      <p style={bodyTextStyle}>
        Capture Gift Aid request and declaration facts here. The final
        claimability outcome is still derived on the committed gift.
      </p>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: '#1f2328',
        }}
      >
        <input
          type="checkbox"
          checked={giftAidRequested}
          onChange={(event) =>
            onGiftAidRequestedChange(getInputEventChecked(event))
          }
        />
        <span>Gift Aid requested for this gift</span>
      </label>

      {giftAidRequested ? (
        <>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#1f2328',
            }}
          >
            <input
              type="checkbox"
              checked={giftAidDeclarationCaptured}
              onChange={(event) =>
                onGiftAidDeclarationCapturedChange(getInputEventChecked(event))
              }
            />
            <span>Declaration captured in this entry flow</span>
          </label>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Declaration date</span>
              <input
                style={inputStyle}
                type="date"
                value={giftAidDeclarationDate}
                onChange={(event) =>
                  onGiftAidDeclarationDateChange(getInputEventValue(event))
                }
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Coverage scope</span>
              <input
                style={inputStyle}
                value={giftAidCoverageScope}
                placeholder="past_and_future"
                onChange={(event) =>
                  onGiftAidCoverageScopeChange(getInputEventValue(event))
                }
              />
            </label>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Declaration source</span>
              <input
                style={inputStyle}
                value={giftAidDeclarationSource}
                placeholder="manual_entry"
                onChange={(event) =>
                  onGiftAidDeclarationSourceChange(getInputEventValue(event))
                }
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Text version</span>
              <input
                style={inputStyle}
                value={giftAidTextVersion}
                placeholder="v1"
                onChange={(event) =>
                  onGiftAidTextVersionChange(getInputEventValue(event))
                }
              />
            </label>
          </div>
        </>
      ) : (
        <div style={secondaryTextStyle}>
          Leave Gift Aid off when no request or declaration facts were captured
          during entry.
        </div>
      )}
    </div>
  );
};
