import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { FUND_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/fund.object';
import { FUND_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/fund-home-core.view';

export default definePageLayout({
  universalIdentifier: '8f4cd2d8-b1c2-4b6c-958b-dc3d919e8425',
  name: 'Fund Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: FUND_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '5caf0fca-3d36-477f-b5e8-b2211ef896fe',
      title: 'Home',
      position: 0,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'fc2ae2d2-dc65-4088-b7be-2d2d6be76a0a',
          title: 'Fund summary',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: FUND_HOME_CORE_VIEW_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
    {
      universalIdentifier: 'e7a48b45-30c7-42b3-a7d8-2d5fc3f34fdb',
      title: 'Fields',
      position: 100,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'ef2d459d-737c-4c14-85f9-78c921f8d565',
          title: 'Fund fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: 'a4863a90-841d-413d-935d-a207bded1a27',
      title: 'Timeline',
      position: 200,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'a907eb10-3eb2-4c47-9b04-f3f4e8bfbff3',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'b76cc45f-5e1e-4d61-ad9f-8788276e69ca',
      title: 'Notes',
      position: 300,
      icon: 'IconNotes',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b7d47e11-16d0-4fdd-b343-8e97170ed403',
          title: 'Notes',
          type: 'NOTES',
          configuration: {
            configurationType: 'NOTES',
          },
        },
      ],
    },
  ],
});
