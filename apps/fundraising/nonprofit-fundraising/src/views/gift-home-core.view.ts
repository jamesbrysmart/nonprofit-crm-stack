import { defineView } from 'twenty-sdk/define';
import { APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/appeal-on-gift.field';
import { COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/company-on-gift.field';
import { DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/donor-on-gift.field';
import { FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/fund-on-gift.field';
import {
  GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
  GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/gift.object';

export const GIFT_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '53595e18-3655-4623-b814-b638db4556db';

const GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '1a227a0e-e298-4230-ab93-667c9a69b1d4';

export default defineView({
  universalIdentifier: GIFT_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Gift home core fields',
  objectUniversalIdentifier: GIFT_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier: GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Home core fields',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'e2cd9133-726f-4084-a090-871437bd7101',
      fieldMetadataUniversalIdentifier: GIFT_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'b49f4ae0-45e6-4632-8ce2-a198e6a7f46a',
      fieldMetadataUniversalIdentifier: GIFT_DATE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '0f278f89-a653-4627-8b76-d7c55a5362fb',
      fieldMetadataUniversalIdentifier:
        GIFT_PAYMENT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c233df82-c338-407b-9597-b3620c3338d1',
      fieldMetadataUniversalIdentifier: DONOR_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '5ad0b798-4b95-4c51-8bd9-2a0d39579677',
      fieldMetadataUniversalIdentifier:
        COMPANY_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '9e8d9486-e6a2-4348-9c30-84289d470757',
      fieldMetadataUniversalIdentifier: APPEAL_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'fc49fa9f-8f91-44b0-a20b-ea91ea555d84',
      fieldMetadataUniversalIdentifier: FUND_ON_GIFT_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        GIFT_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 6,
      isVisible: true,
      size: 220,
    },
  ],
});
