import { defineFrontComponent } from 'twenty-sdk/define';
import { ManualGiftEntryGiftAidSection } from 'src/manual-gift-entry/manual-gift-entry-gift-aid-capture';
import {
  DonorContextSection,
  DuplicateGiftWarning,
  GiftBasicsSection,
  NewGiftActionFooter,
  RecurringLinkageSection,
} from 'src/manual-gift-entry/new-gift-sections';
import {
  isGiftAidEnabled,
  panelStyle,
} from 'src/manual-gift-entry/new-gift-support';
import { useNewGiftController } from 'src/manual-gift-entry/use-new-gift-controller';

export const NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c813555c-eec2-42df-a29b-cd8817e0f4d6';

export const NEW_GIFT_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'ef13b0da-7934-47cf-b09b-57a67695756d';

const NewGift = () => {
  const controller = useNewGiftController();

  return (
    <div style={panelStyle}>
      <DonorContextSection controller={controller} />
      <GiftBasicsSection controller={controller} />
      <RecurringLinkageSection controller={controller} />
      <ManualGiftEntryGiftAidSection
        donorType={controller.donorType}
        includedInFlow={isGiftAidEnabled && !controller.isAnonymousDonor}
        giftAidRequested={controller.giftAidRequested}
        giftAidDeclarationCaptured={controller.giftAidDeclarationCaptured}
        giftAidDeclarationDate={controller.giftAidDeclarationDate}
        giftAidCoverageScope={controller.giftAidCoverageScope}
        giftAidDeclarationSource={controller.giftAidDeclarationSource}
        giftAidTextVersion={controller.giftAidTextVersion}
        onGiftAidRequestedChange={controller.setGiftAidRequested}
        onGiftAidDeclarationCapturedChange={
          controller.setGiftAidDeclarationCaptured
        }
        onGiftAidDeclarationDateChange={controller.setGiftAidDeclarationDate}
        onGiftAidCoverageScopeChange={controller.setGiftAidCoverageScope}
        onGiftAidDeclarationSourceChange={
          controller.setGiftAidDeclarationSource
        }
        onGiftAidTextVersionChange={controller.setGiftAidTextVersion}
      />
      <DuplicateGiftWarning controller={controller} />
      <NewGiftActionFooter controller={controller} />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'new-gift',
  description: 'Creates a gift through manual entry.',
  component: NewGift,
});
