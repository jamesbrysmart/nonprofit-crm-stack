import type { RollupConfig } from './index';

export const defaultRollupConfig: RollupConfig = [
  {
    parentObject: 'person',
    childObject: 'gift',
    relationField: 'donorId',
    childFilters: [
      {
        field: 'amount.amountMicros',
        operator: 'gt',
        value: 0,
      },
    ],
    aggregations: [
      {
        type: 'SUM',
        childField: 'amount.amountMicros',
        parentField: 'lifetimeGiftAmount',
        currencyField: 'amount.currencyCode',
      },
      {
        type: 'COUNT',
        parentField: 'lifetimeGiftCount',
      },
      {
        type: 'MAX',
        childField: 'giftDate',
        parentField: 'lastGiftDate',
      },
      {
        type: 'MIN',
        childField: 'giftDate',
        parentField: 'firstGiftDate',
      },
      {
        type: 'SUM',
        childField: 'amount.amountMicros',
        parentField: 'yearToDateGiftAmount',
        currencyField: 'amount.currencyCode',
        filters: [
          {
            field: 'giftDate',
            operator: 'gte',
            dynamicValue: 'startOfYear',
          },
        ],
      },
      {
        type: 'COUNT',
        parentField: 'yearToDateGiftCount',
        filters: [
          {
            field: 'giftDate',
            operator: 'gte',
            dynamicValue: 'startOfYear',
          },
        ],
      },
    ],
  },
];
