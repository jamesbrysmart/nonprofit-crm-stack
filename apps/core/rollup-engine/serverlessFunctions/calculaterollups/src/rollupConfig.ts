import type { RollupConfig } from './types';

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
  {
    parentObject: 'household',
    childObject: 'person',
    relationField: 'householdId',
    aggregations: [
      {
        type: 'SUM',
        childField: 'lifetimeGiftAmount.amountMicros',
        parentField: 'lifetimeGiftAmount',
        currencyField: 'lifetimeGiftAmount.currencyCode',
      },
      {
        type: 'SUM',
        childField: 'lifetimeGiftCount',
        parentField: 'lifetimeGiftCount',
      },
      {
        type: 'MIN',
        childField: 'firstGiftDate',
        parentField: 'firstGiftDate',
      },
      {
        type: 'MAX',
        childField: 'lastGiftDate',
        parentField: 'lastGiftDate',
      },
      {
        type: 'SUM',
        childField: 'yearToDateGiftAmount.amountMicros',
        parentField: 'yearToDateGiftAmount',
        currencyField: 'yearToDateGiftAmount.currencyCode',
      },
      {
        type: 'SUM',
        childField: 'yearToDateGiftCount',
        parentField: 'yearToDateGiftCount',
      },
    ],
  },
  {
    parentObject: 'company',
    childObject: 'gift',
    relationField: 'companyId',
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
  {
    parentObject: 'appeal',
    childObject: 'gift',
    relationField: 'appealId',
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
        parentField: 'raisedAmount',
        currencyField: 'amount.currencyCode',
      },
      {
        type: 'COUNT',
        parentField: 'giftCount',
      },
    ],
  },
  {
    parentObject: 'recurringAgreement',
    childObject: 'gift',
    relationField: 'recurringAgreementId',
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
        parentField: 'totalReceivedAmount',
        currencyField: 'amount.currencyCode',
      },
      {
        type: 'COUNT',
        parentField: 'paidInstallmentCount',
      },
      {
        type: 'MAX',
        childField: 'giftDate',
        parentField: 'lastPaidAt',
      },
    ],
  },
  {
    parentObject: 'giftPayout',
    childObject: 'gift',
    relationField: 'giftPayoutId',
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
        parentField: 'matchedGrossAmount',
        currencyField: 'amount.currencyCode',
      },
      {
        type: 'SUM',
        childField: 'feeAmount.amountMicros',
        parentField: 'matchedFeeAmount',
        currencyField: 'feeAmount.currencyCode',
      },
      {
        type: 'COUNT',
        parentField: 'matchedGiftCount',
      },
    ],
  },
  {
    parentObject: 'giftPayout',
    childObject: 'giftStaging',
    relationField: 'giftPayoutId',
    aggregations: [
      {
        type: 'COUNT',
        parentField: 'pendingStagingCount',
        filters: [
          {
            field: 'promotionStatus',
            operator: 'notEquals',
            value: 'committed',
          },
        ],
      },
    ],
  },
];
