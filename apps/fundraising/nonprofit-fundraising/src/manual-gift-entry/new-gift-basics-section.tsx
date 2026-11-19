import { Callout } from 'twenty-ui/components/feedback';
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from 'src/front-components/form-controls';
import type {
  ManualGiftPaymentType,
  ManualGiftType,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  getCurrencyOptions,
  fieldGridStyle,
  PAYMENT_TYPE_OPTIONS,
  sectionStyle,
  sectionTitleStyle,
} from 'src/manual-gift-entry/new-gift-support';

const getGiftTypeOptions = (donorType: 'INDIVIDUAL' | 'COMPANY') =>
  donorType === 'COMPANY'
    ? [
        { value: 'DONATION', label: 'Donation' },
        { value: 'GRANT', label: 'Grant' },
        { value: 'SPONSORSHIP', label: 'Sponsorship' },
        { value: 'GIFT_IN_KIND', label: 'Gift in kind' },
      ]
    : [
        { value: 'DONATION', label: 'Donation' },
        { value: 'GIFT_IN_KIND', label: 'Gift in kind' },
      ];

export const GiftBasicsSection = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const {
    donorType,
    giftType,
    setGiftType,
    description,
    setDescription,
    amountValue,
    setAmountValue,
    currencyCode,
    setCurrencyCode,
    reportingCurrencyCode,
    needsReportingAmount,
    reportingAmountValue,
    setReportingAmountValue,
    paymentType,
    setPaymentType,
    provider,
    setProvider,
    giftDate,
    setGiftDate,
    fundOptions,
    appealOptions,
    appealSourceOptions,
    selectedFundId,
    setSelectedFundId,
    selectedAppealId,
    setSelectedAppealId,
    selectedAppealSourceId,
    setSelectedAppealSourceId,
    loadingFundOptions,
    loadingAppealOptions,
    loadingAppealSourceOptions,
    fundOptionsError,
    appealOptionsError,
    appealSourceOptionsError,
  } = controller;

  return (
    <div style={sectionStyle}>
      <div style={sectionTitleStyle}>Gift basics</div>
      <div style={fieldGridStyle}>
        <FormSelect
          label="Gift type"
          value={giftType}
          onChange={(value) => setGiftType(value as ManualGiftType)}
          options={getGiftTypeOptions(donorType)}
        />
        <FormInput
          label="Amount"
          inputMode="decimal"
          placeholder="25.00"
          value={amountValue}
          onChange={setAmountValue}
        />
        <FormSelect
          label="Currency"
          value={currencyCode}
          onChange={setCurrencyCode}
          options={getCurrencyOptions(reportingCurrencyCode).map((currency) => ({
            value: currency,
            label: currency,
          }))}
        />
        {needsReportingAmount ? (
          <FormInput
            label={`Amount in ${reportingCurrencyCode}`}
            inputMode="decimal"
            placeholder="Optional"
            description={`What the gift is worth in ${reportingCurrencyCode}, for example the amount credited to the bank. Without it the gift is recorded but left out of ${reportingCurrencyCode} totals until a reporting amount is added.`}
            value={reportingAmountValue}
            onChange={setReportingAmountValue}
          />
        ) : null}
        <FormSelect
          label="Payment type"
          value={paymentType}
          onChange={(value) => setPaymentType(value as ManualGiftPaymentType)}
          options={PAYMENT_TYPE_OPTIONS}
        />
        <FormInput
          label="Payment/source"
          placeholder="Stripe, JustGiving, bank"
          value={provider}
          onChange={setProvider}
        />
        <FormInput
          label="Gift date"
          type="date"
          value={giftDate}
          onChange={setGiftDate}
        />
      </div>

      {giftType === 'GIFT_IN_KIND' ? (
        <>
          <Callout
            status="warning"
            title="Gift in kind"
            description="Record the estimated support value for this gift in kind. It will remain visible in CRM context, but it is excluded from default cash donation totals and reconciliation-style views."
          />
          <FormTextarea
            label="Description"
            placeholder="What was donated?"
            value={description}
            onChange={setDescription}
            description="Describe the donated goods or services so the record is meaningful in supporter, company, and appeal context."
          />
        </>
      ) : null}

      <div style={fieldGridStyle}>
        <FormSelect
          label="Appeal"
          value={selectedAppealId}
          onChange={setSelectedAppealId}
          emptyOptionLabel="No appeal"
          options={appealOptions.map((appeal) => ({
            value: appeal.id,
            label: appeal.name ?? 'Untitled appeal',
          }))}
          disabled={loadingAppealOptions}
          error={appealOptionsError}
        />
        <FormSelect
          label="Appeal source"
          value={selectedAppealSourceId}
          onChange={setSelectedAppealSourceId}
          emptyOptionLabel="No appeal source"
          options={appealSourceOptions.map((appealSource) => ({
            value: appealSource.id,
            label: appealSource.name ?? 'Untitled appeal source',
          }))}
          disabled={loadingAppealSourceOptions}
          error={appealSourceOptionsError}
        />
        <FormSelect
          label="Fund"
          value={selectedFundId}
          onChange={setSelectedFundId}
          emptyOptionLabel="No fund"
          options={fundOptions.map((fund) => ({
            value: fund.id,
            label: `${fund.name ?? 'Untitled fund'}${fund.code ? ` (${fund.code})` : ''}`,
          }))}
          disabled={loadingFundOptions}
          error={fundOptionsError}
        />
      </div>
    </div>
  );
};
