export type RecordGiftRefundRequest = {
  giftId: string;
  refundedAmountMicros: number;
  refundDate: string;
  refundNote?: string | null;
};

export type RecordGiftRefundResponse = {
  giftId: string;
  refundedAmountMicros: number;
  refundDate: string;
  refundState: 'NOT_REFUNDED' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED';
};
