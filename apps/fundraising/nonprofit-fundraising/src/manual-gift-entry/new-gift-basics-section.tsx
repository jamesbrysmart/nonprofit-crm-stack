import type {
  ManualGiftPaymentType,
  ManualGiftType,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  CURRENCY_OPTIONS,
  fieldGridStyle,
  fieldStyle,
  getInputEventValue,
  inputStyle,
  labelStyle,
  PAYMENT_TYPE_OPTIONS,
  secondaryTextStyle,
  sectionStyle,
  sectionTitleStyle,
  warningSectionStyle,
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
    paymentType,
    setPaymentType,
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
  const giftTypeOptions = getGiftTypeOptions(donorType);

  return (
    <div style={sectionStyle}>
      <div style={sectionTitleStyle}>Gift basics</div>
      <div style={fieldGridStyle}>
        <label style={fieldStyle}>
          <span style={labelStyle}>Gift type</span>
          <select
            style={inputStyle}
            value={giftType}
            onChange={(event) =>
              setGiftType(getInputEventValue(event) as ManualGiftType)
            }
          >
            {giftTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Amount</span>
          <input
            style={inputStyle}
            inputMode="decimal"
            placeholder="25.00"
            value={amountValue}
            onChange={(event) => setAmountValue(getInputEventValue(event))}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Currency</span>
          <select
            style={inputStyle}
            value={currencyCode}
            onChange={(event) => setCurrencyCode(getInputEventValue(event))}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Payment type</span>
          <select
            style={inputStyle}
            value={paymentType}
            onChange={(event) =>
              setPaymentType(getInputEventValue(event) as ManualGiftPaymentType)
            }
          >
            {PAYMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Gift date</span>
          <input
            style={inputStyle}
            type="date"
            value={giftDate}
            onChange={(event) => setGiftDate(getInputEventValue(event))}
          />
        </label>
      </div>

      {giftType === 'GIFT_IN_KIND' ? (
        <div style={warningSectionStyle}>
          Record the estimated support value for this gift in kind. It will
          remain visible in CRM context, but it is excluded from default cash
          donation totals and reconciliation-style views.
        </div>
      ) : null}

      {giftType === 'GIFT_IN_KIND' ? (
        <label style={fieldStyle}>
          <span style={labelStyle}>Description</span>
          <textarea
            style={{
              ...inputStyle,
              minHeight: '88px',
              resize: 'vertical',
            }}
            placeholder="What was donated?"
            value={description}
            onChange={(event) => setDescription(getInputEventValue(event))}
          />
          <span style={secondaryTextStyle}>
            Describe the donated goods or services so the record is meaningful
            in supporter, company, and appeal context.
          </span>
        </label>
      ) : null}

      <div style={fieldGridStyle}>
        <label style={fieldStyle}>
          <span style={labelStyle}>Appeal</span>
          <select
            style={inputStyle}
            value={selectedAppealId}
            onChange={(event) => setSelectedAppealId(getInputEventValue(event))}
            disabled={loadingAppealOptions}
          >
            <option value="">No appeal</option>
            {appealOptions.map((appeal) => (
              <option key={appeal.id} value={appeal.id}>
                {appeal.name ?? 'Untitled appeal'}
              </option>
            ))}
          </select>
          {appealOptionsError ? (
            <span style={secondaryTextStyle}>{appealOptionsError}</span>
          ) : null}
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Appeal source</span>
          <select
            style={inputStyle}
            value={selectedAppealSourceId}
            onChange={(event) =>
              setSelectedAppealSourceId(getInputEventValue(event))
            }
            disabled={loadingAppealSourceOptions}
          >
            <option value="">No appeal source</option>
            {appealSourceOptions.map((appealSource) => (
              <option key={appealSource.id} value={appealSource.id}>
                {appealSource.name ?? 'Untitled appeal source'}
              </option>
            ))}
          </select>
          {appealSourceOptionsError ? (
            <span style={secondaryTextStyle}>{appealSourceOptionsError}</span>
          ) : null}
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Fund</span>
          <select
            style={inputStyle}
            value={selectedFundId}
            onChange={(event) => setSelectedFundId(getInputEventValue(event))}
            disabled={loadingFundOptions}
          >
            <option value="">No fund</option>
            {fundOptions.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name ?? 'Untitled fund'}
                {fund.code ? ` (${fund.code})` : ''}
              </option>
            ))}
          </select>
          {fundOptionsError ? (
            <span style={secondaryTextStyle}>{fundOptionsError}</span>
          ) : null}
        </label>
      </div>
    </div>
  );
};
