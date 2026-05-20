import { defineView } from 'twenty-sdk/define';
import {
  FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
  FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/fund.object';

export const FUND_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER =
  '826a09b6-5326-4b95-a434-b6cadcb2dd23';

const FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER =
  '0b297237-25bf-4887-aaf0-fd81aa0bdff2';

export default defineView({
  universalIdentifier: FUND_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Fund home core fields',
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconHome',
  position: 100,
  fieldGroups: [
    {
      universalIdentifier: FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      name: 'Home core fields',
      position: 0,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '42a1b7f1-d1fd-446c-8cd2-c8ed6cd3d046',
      fieldMetadataUniversalIdentifier: FUND_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '04c49797-a03b-48db-a5b9-bd1cae5df2e6',
      fieldMetadataUniversalIdentifier:
        FUND_RESTRICTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4587bb18-89a4-49be-b662-cb5b13deba20',
      fieldMetadataUniversalIdentifier:
        FUND_EXTERNAL_ACCOUNTING_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'ea3f95a4-75c6-40e6-afae-e2a366426760',
      fieldMetadataUniversalIdentifier: FUND_IS_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER,
      viewFieldGroupUniversalIdentifier:
        FUND_HOME_CORE_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 120,
    },
  ],
});
