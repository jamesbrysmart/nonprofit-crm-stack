import {
  FormCheckbox,
  FormInput,
} from 'src/front-components/form-controls';
import type { ManualGiftDonorType } from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  bodyTextStyle,
  fieldGridStyle,
  secondaryTextStyle,
  sectionStyle,
  sectionTitleStyle,
} from 'src/manual-gift-entry/new-gift-support';

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

type ManualGiftEntryGiftAidSectionProps =
  ManualGiftEntryGiftAidCaptureProps & {
    donorType: ManualGiftDonorType;
    includedInFlow: boolean;
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
}: ManualGiftEntryGiftAidCaptureProps) => (
  <div style={sectionStyle}>
    <div style={sectionTitleStyle}>Gift Aid</div>

    <FormCheckbox
      label="Gift Aid applies"
      checked={giftAidRequested}
      onChange={onGiftAidRequestedChange}
    />

    {giftAidRequested ? (
      <>
        <p style={bodyTextStyle}>
          Add Gift Aid details only when they were captured during entry.
        </p>
        <FormCheckbox
          label="Declaration captured during entry"
          checked={giftAidDeclarationCaptured}
          onChange={onGiftAidDeclarationCapturedChange}
        />
        <div style={fieldGridStyle}>
          <FormInput
            label="Declaration date"
            type="date"
            value={giftAidDeclarationDate}
            onChange={onGiftAidDeclarationDateChange}
          />
          <FormInput
            label="Coverage scope"
            placeholder="Past and future"
            value={giftAidCoverageScope}
            onChange={onGiftAidCoverageScopeChange}
          />
          <FormInput
            label="Declaration source"
            placeholder="Manual entry"
            value={giftAidDeclarationSource}
            onChange={onGiftAidDeclarationSourceChange}
          />
          <FormInput
            label="Text version"
            placeholder="v1"
            value={giftAidTextVersion}
            onChange={onGiftAidTextVersionChange}
          />
        </div>
      </>
    ) : (
      <div style={secondaryTextStyle}>
        Leave this off unless Gift Aid details were taken during entry.
      </div>
    )}
  </div>
);

export const ManualGiftEntryGiftAidSection = ({
  donorType,
  includedInFlow,
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
}: ManualGiftEntryGiftAidSectionProps) => {
  if (!includedInFlow || donorType !== 'INDIVIDUAL') {
    return null;
  }

  return (
    <ManualGiftEntryGiftAidCapture
      giftAidRequested={giftAidRequested}
      giftAidDeclarationCaptured={giftAidDeclarationCaptured}
      giftAidDeclarationDate={giftAidDeclarationDate}
      giftAidCoverageScope={giftAidCoverageScope}
      giftAidDeclarationSource={giftAidDeclarationSource}
      giftAidTextVersion={giftAidTextVersion}
      onGiftAidRequestedChange={onGiftAidRequestedChange}
      onGiftAidDeclarationCapturedChange={onGiftAidDeclarationCapturedChange}
      onGiftAidDeclarationDateChange={onGiftAidDeclarationDateChange}
      onGiftAidCoverageScopeChange={onGiftAidCoverageScopeChange}
      onGiftAidDeclarationSourceChange={onGiftAidDeclarationSourceChange}
      onGiftAidTextVersionChange={onGiftAidTextVersionChange}
    />
  );
};
