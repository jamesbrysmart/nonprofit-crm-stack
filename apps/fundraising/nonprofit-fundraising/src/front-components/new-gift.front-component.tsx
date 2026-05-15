import { defineFrontComponent } from 'twenty-sdk/define';
import { closeSidePanel } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import { ManualGiftEntryGiftAidSection } from 'src/manual-gift-entry/manual-gift-entry-gift-aid-capture';
import type {
  ManualGiftDuplicateMatch,
  ManualGiftPaymentType,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  bodyTextStyle,
  buildCompanyDisplayName,
  buildOpportunityDisplayName,
  buildPersonDisplayName,
  buildRecurringAgreementDisplayName,
  candidateButtonStyle,
  compactMatchActionStyle,
  compactMatchInfoStyle,
  compactTextActionStyle,
  CURRENCY_OPTIONS,
  formatAmountMicros,
  getInputEventChecked,
  getInputEventValue,
  inlineMatchSectionStyle,
  inputStyle,
  isGiftAidEnabled,
  labelStyle,
  panelStyle,
  PAYMENT_TYPE_OPTIONS,
  secondaryChoiceRowStyle,
  secondaryTextStyle,
  sectionHeaderRowStyle,
  sectionStyle,
  sectionTitleStyle,
  segmentedControlStyle,
  segmentedOptionStyle,
  selectedCandidateButtonStyle,
  selectedSegmentedOptionStyle,
  selectedStateInfoStyle,
  selectedSummaryStyle,
  warningSectionStyle,
} from 'src/manual-gift-entry/new-gift-support';
import { useNewGiftController } from 'src/manual-gift-entry/use-new-gift-controller';

export const NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c813555c-eec2-42df-a29b-cd8817e0f4d6';

export const NEW_GIFT_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'ef13b0da-7934-47cf-b09b-57a67695756d';

const NewGift = () => {
  const {
    donorType,
    setDonorType,
    donorFirstName,
    setDonorFirstName,
    donorLastName,
    setDonorLastName,
    donorEmail,
    setDonorEmail,
    companyName,
    setCompanyName,
    amountValue,
    setAmountValue,
    currencyCode,
    setCurrencyCode,
    paymentType,
    setPaymentType,
    giftDate,
    setGiftDate,
    appealName,
    setAppealName,
    includeDonorAddress,
    setIncludeDonorAddress,
    addressStreet1,
    setAddressStreet1,
    addressStreet2,
    setAddressStreet2,
    addressCity,
    setAddressCity,
    addressState,
    setAddressState,
    addressPostcode,
    setAddressPostcode,
    addressCountry,
    setAddressCountry,
    giftAidRequested,
    setGiftAidRequested,
    giftAidDeclarationCaptured,
    setGiftAidDeclarationCaptured,
    giftAidDeclarationDate,
    setGiftAidDeclarationDate,
    giftAidCoverageScope,
    setGiftAidCoverageScope,
    giftAidDeclarationSource,
    setGiftAidDeclarationSource,
    giftAidTextVersion,
    setGiftAidTextVersion,
    linkRecurringAgreement,
    setLinkRecurringAgreement,
    recurringSearchQuery,
    setRecurringSearchQuery,
    recurringResults,
    selectedRecurringAgreementId,
    setSelectedRecurringAgreementId,
    searchingRecurring,
    duplicateResult,
    donorChoice,
    setDonorChoice,
    selectedDonorId,
    setSelectedDonorId,
    companyDuplicateResult,
    companyChoice,
    setCompanyChoice,
    selectedCompanyId,
    setSelectedCompanyId,
    linkOpportunity,
    setLinkOpportunity,
    opportunitySearchQuery,
    setOpportunitySearchQuery,
    opportunityResults,
    selectedOpportunityId,
    setSelectedOpportunityId,
    searchingOpportunities,
    duplicateGiftCheckResult,
    duplicateInterruptionVisible,
    companyDuplicateInterruptionVisible,
    duplicateGiftWarningVisible,
    selectedDonorSummary,
    selectedCompanySummary,
    canSearchRecurring,
    canSearchOpportunities,
    submitting,
    handleSubmit,
    handleSearchRecurringAgreements,
    handleSearchOpportunities,
  } = useNewGiftController();

  return (
    <div style={panelStyle}>
      <div style={sectionStyle}>
        <div style={sectionHeaderRowStyle}>
          <div style={sectionTitleStyle}>Donor context</div>
          <div style={segmentedControlStyle} role="tablist" aria-label="Donor type">
            {(['INDIVIDUAL', 'COMPANY'] as const).map((option) => {
              const isSelected = donorType === option;

              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  style={
                    isSelected
                      ? selectedSegmentedOptionStyle
                      : segmentedOptionStyle
                  }
                  onClick={() => {
                    setDonorType(option);
                  }}
                >
                  {option === 'INDIVIDUAL' ? 'Individual' : 'Company'}
                </button>
              );
            })}
          </div>
        </div>

        {donorType === 'INDIVIDUAL' ? (
          <>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>First name</span>
                <input
                  style={inputStyle}
                  value={donorFirstName}
                  onChange={(event) =>
                    setDonorFirstName(getInputEventValue(event))
                  }
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>Last name</span>
                <input
                  style={inputStyle}
                  value={donorLastName}
                  onChange={(event) =>
                    setDonorLastName(getInputEventValue(event))
                  }
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Email</span>
              <input
                style={inputStyle}
                type="email"
                value={donorEmail}
                onChange={(event) => setDonorEmail(getInputEventValue(event))}
              />
            </label>

            {duplicateInterruptionVisible && duplicateResult ? (
              <div style={inlineMatchSectionStyle}>
                <div style={sectionTitleStyle}>Donor match</div>
                <div style={secondaryTextStyle}>
                  {duplicateResult.status === 'SINGLE_EXACT_MATCH'
                    ? 'We found one donor with this name. Use that donor or continue with a new donor.'
                    : 'We found more than one donor with this name. Choose the right donor or continue with a new donor.'}
                </div>

                {donorChoice === 'USE_EXISTING' && selectedDonorSummary ? (
                  <div style={selectedSummaryStyle}>
                    <div style={selectedStateInfoStyle}>
                      <div style={sectionTitleStyle}>Selected donor</div>
                      <strong>{buildPersonDisplayName(selectedDonorSummary)}</strong>
                      <span style={secondaryTextStyle}>
                        {selectedDonorSummary.emails?.primaryEmail?.trim() ||
                          'No email on record'}
                      </span>
                    </div>
                    <button
                      type="button"
                      style={compactTextActionStyle}
                      onClick={() => {
                        setSelectedDonorId(null);
                        setDonorChoice(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {duplicateResult.candidates.map((candidate) => {
                        const isSelected = candidate.id === selectedDonorId;
                        const email = candidate.emails?.primaryEmail?.trim();

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedDonorId(candidate.id);
                              setDonorChoice('USE_EXISTING');
                            }}
                          >
                            <div style={compactMatchInfoStyle}>
                              <strong>{buildPersonDisplayName(candidate)}</strong>
                              <span style={secondaryTextStyle}>
                                {email === undefined || email === ''
                                  ? 'No email on record'
                                  : email}
                              </span>
                            </div>
                            <span style={compactMatchActionStyle}>
                              {isSelected ? 'Selected' : 'Use donor'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={secondaryChoiceRowStyle}>
                      <span style={secondaryTextStyle}>
                        No suitable donor listed?
                      </span>
                      <button
                        type="button"
                        style={compactTextActionStyle}
                        onClick={() => {
                          setSelectedDonorId(null);
                          setDonorChoice('CREATE_NEW');
                        }}
                      >
                        Create new donor
                      </button>
                    </div>
                  </>
                )}

              </div>
            ) : null}

            <div style={{ display: 'grid', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#1f2328',
                }}
              >
                <input
                  type="checkbox"
                  checked={includeDonorAddress}
                  onChange={(event) =>
                    setIncludeDonorAddress(getInputEventChecked(event))
                  }
                />
                <span>Add donor address</span>
              </label>

              {includeDonorAddress ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={bodyTextStyle}>
                    Address is only used if this gift creates a new donor.
                    Existing donor addresses are not updated in this flow.
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: '1fr 1fr',
                    }}
                  >
                    <label
                      style={{
                        display: 'grid',
                        gap: '6px',
                        gridColumn: '1 / -1',
                      }}
                    >
                      <span style={labelStyle}>Address line 1</span>
                      <input
                        style={inputStyle}
                        value={addressStreet1}
                        onChange={(event) =>
                          setAddressStreet1(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label
                      style={{
                        display: 'grid',
                        gap: '6px',
                        gridColumn: '1 / -1',
                      }}
                    >
                      <span style={labelStyle}>Address line 2</span>
                      <input
                        style={inputStyle}
                        value={addressStreet2}
                        onChange={(event) =>
                          setAddressStreet2(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>City</span>
                      <input
                        style={inputStyle}
                        value={addressCity}
                        onChange={(event) =>
                          setAddressCity(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>County / state</span>
                      <input
                        style={inputStyle}
                        value={addressState}
                        onChange={(event) =>
                          setAddressState(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Postcode</span>
                      <input
                        style={inputStyle}
                        value={addressPostcode}
                        onChange={(event) =>
                          setAddressPostcode(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Country</span>
                      <input
                        style={inputStyle}
                        value={addressCountry}
                        onChange={(event) =>
                          setAddressCountry(getInputEventValue(event))
                        }
                      />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={labelStyle}>Company name</span>
              <input
                style={inputStyle}
                value={companyName}
                onChange={(event) => setCompanyName(getInputEventValue(event))}
              />
            </label>
            <p style={bodyTextStyle}>
              Company gifts are matched against existing company records.
            </p>

            {companyDuplicateInterruptionVisible && companyDuplicateResult ? (
              <div style={inlineMatchSectionStyle}>
                <div style={sectionTitleStyle}>Company match</div>
                <div style={secondaryTextStyle}>
                  {companyDuplicateResult.status === 'SINGLE_EXACT_MATCH'
                    ? 'We found one company with this name. Use that company or continue with a new company.'
                    : 'We found more than one company with this name. Choose the right company or continue with a new company.'}
                </div>

                {companyChoice === 'USE_EXISTING' && selectedCompanySummary ? (
                  <div style={selectedSummaryStyle}>
                    <div style={selectedStateInfoStyle}>
                      <div style={sectionTitleStyle}>Selected company</div>
                      <strong>{buildCompanyDisplayName(selectedCompanySummary)}</strong>
                    </div>
                    <button
                      type="button"
                      style={compactTextActionStyle}
                      onClick={() => {
                        setSelectedCompanyId(null);
                        setCompanyChoice(null);
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {companyDuplicateResult.candidates.map((candidate) => {
                        const isSelected = candidate.id === selectedCompanyId;

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedCompanyId(candidate.id);
                              setCompanyChoice('USE_EXISTING');
                            }}
                          >
                            <div style={compactMatchInfoStyle}>
                              <strong>{buildCompanyDisplayName(candidate)}</strong>
                            </div>
                            <span style={compactMatchActionStyle}>
                              {isSelected ? 'Selected' : 'Use company'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={secondaryChoiceRowStyle}>
                      <span style={secondaryTextStyle}>
                        No suitable company listed?
                      </span>
                      <button
                        type="button"
                        style={compactTextActionStyle}
                        onClick={() => {
                          setSelectedCompanyId(null);
                          setCompanyChoice('CREATE_NEW');
                        }}
                      >
                        Create new company
                      </button>
                    </div>
                  </>
                )}

              </div>
            ) : null}

            <div style={{ display: 'grid', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#1f2328',
                }}
              >
                <input
                  type="checkbox"
                  checked={linkOpportunity}
                  onChange={(event) => {
                    const checked = getInputEventChecked(event);
                    setLinkOpportunity(checked);

                    if (!checked) {
                      setOpportunitySearchQuery('');
                      setOpportunityResults([]);
                      setSelectedOpportunityId(null);
                    }
                  }}
                />
                <span>Link an opportunity</span>
              </label>

              {linkOpportunity ? (
                <>
                  <p style={bodyTextStyle}>
                    Add an opportunity when this gift relates to a grant,
                    sponsorship, or similar company gift.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gap: '12px',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'end',
                    }}
                  >
                    <label style={{ display: 'grid', gap: '6px' }}>
                      <span style={labelStyle}>Search opportunities</span>
                      <input
                        style={inputStyle}
                        value={opportunitySearchQuery}
                        placeholder={
                          selectedCompanyId
                            ? 'Opportunity name'
                            : 'Opportunity name (searches all companies)'
                        }
                        onChange={(event) =>
                          setOpportunitySearchQuery(getInputEventValue(event))
                        }
                      />
                    </label>

                    <div>
                      <Button
                        title={
                          searchingOpportunities ? 'Searching...' : 'Search'
                        }
                        variant="secondary"
                        onClick={() => {
                          void handleSearchOpportunities();
                        }}
                        disabled={
                          searchingOpportunities ||
                          submitting ||
                          !canSearchOpportunities
                        }
                      />
                    </div>
                  </div>

                  {opportunityResults.length > 0 ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {opportunityResults.map((opportunity) => {
                        const isSelected =
                          opportunity.id === selectedOpportunityId;

                        return (
                          <button
                            key={opportunity.id}
                            type="button"
                            style={
                              isSelected
                                ? selectedCandidateButtonStyle
                                : candidateButtonStyle
                            }
                            onClick={() => {
                              setSelectedOpportunityId(opportunity.id);
                            }}
                          >
                            <strong>
                              {buildOpportunityDisplayName(opportunity)}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </>
        )}

      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Gift basics</div>
        <div
          style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: '1fr 1fr',
          }}
        >
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Amount</span>
            <input
              style={inputStyle}
              inputMode="decimal"
              placeholder="25.00"
              value={amountValue}
              onChange={(event) => setAmountValue(getInputEventValue(event))}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
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

          <label style={{ display: 'grid', gap: '6px' }}>
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

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyle}>Gift date</span>
            <input
              style={inputStyle}
              type="date"
              value={giftDate}
              onChange={(event) => setGiftDate(getInputEventValue(event))}
            />
          </label>
        </div>

        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={labelStyle}>Appeal</span>
          <input
            style={inputStyle}
            value={appealName}
            placeholder="Appeal name"
            onChange={(event) => setAppealName(getInputEventValue(event))}
          />
        </label>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Recurring linkage</div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#1f2328',
          }}
        >
          <input
            type="checkbox"
            checked={linkRecurringAgreement}
            onChange={(event) => {
              const checked = getInputEventChecked(event);
              setLinkRecurringAgreement(checked);

              if (!checked) {
                setRecurringResults([]);
                setSelectedRecurringAgreementId(null);
                setRecurringSearchQuery('');
              }
            }}
            />
          <span>Link to an existing recurring agreement</span>
        </label>

        {linkRecurringAgreement ? (
          <>
            <p style={bodyTextStyle}>
              Use this only when the gift belongs to an existing recurring
              agreement.
            </p>
            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: '1fr auto',
                alignItems: 'end',
              }}
            >
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={labelStyle}>Search recurring agreements</span>
                <input
                  style={inputStyle}
                  value={recurringSearchQuery}
                  placeholder="Donor name, agreement name, or reference"
                  onChange={(event) =>
                    setRecurringSearchQuery(getInputEventValue(event))
                  }
                />
              </label>

              <div>
                <Button
                  title={searchingRecurring ? 'Searching...' : 'Search'}
                  variant="secondary"
                  onClick={() => {
                    void handleSearchRecurringAgreements();
                  }}
                  disabled={searchingRecurring || submitting || !canSearchRecurring}
                />
              </div>
            </div>

            {recurringResults.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {recurringResults.map((agreement) => {
                  const isSelected =
                    agreement.id === selectedRecurringAgreementId;

                  return (
                    <button
                      key={agreement.id}
                      type="button"
                      style={
                        isSelected
                          ? selectedCandidateButtonStyle
                          : candidateButtonStyle
                      }
                      onClick={() => {
                        setSelectedRecurringAgreementId(agreement.id);
                      }}
                    >
                      <strong>
                        {buildRecurringAgreementDisplayName(agreement)}
                      </strong>
                      <span style={secondaryTextStyle}>
                        {agreement.status ?? 'Status unavailable'} ·{' '}
                        {agreement.nextExpectedAt ?? 'No next date'} ·{' '}
                        {agreement.provider ?? 'MANUAL'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <ManualGiftEntryGiftAidSection
        donorType={donorType}
        includedInFlow={isGiftAidEnabled}
        giftAidRequested={giftAidRequested}
        giftAidDeclarationCaptured={giftAidDeclarationCaptured}
        giftAidDeclarationDate={giftAidDeclarationDate}
        giftAidCoverageScope={giftAidCoverageScope}
        giftAidDeclarationSource={giftAidDeclarationSource}
        giftAidTextVersion={giftAidTextVersion}
        onGiftAidRequestedChange={setGiftAidRequested}
        onGiftAidDeclarationCapturedChange={setGiftAidDeclarationCaptured}
        onGiftAidDeclarationDateChange={setGiftAidDeclarationDate}
        onGiftAidCoverageScopeChange={setGiftAidCoverageScope}
        onGiftAidDeclarationSourceChange={setGiftAidDeclarationSource}
        onGiftAidTextVersionChange={setGiftAidTextVersion}
      />

      {duplicateGiftWarningVisible && duplicateGiftCheckResult ? (
        <div style={warningSectionStyle}>
          <div style={sectionTitleStyle}>Possible duplicate gift</div>
          <div style={secondaryTextStyle}>
            A gift with the same donor or company, amount, and date already
            exists or is waiting to be processed. This is a warning only. You
            can still create the gift if it is genuinely separate.
          </div>

          <div style={{ display: 'grid', gap: '10px' }}>
            {duplicateGiftCheckResult.matches.map(
              (match: ManualGiftDuplicateMatch) => (
                <div key={`${match.kind}:${match.id}`} style={candidateButtonStyle}>
                  <strong>{match.name}</strong>
                  <span style={secondaryTextStyle}>
                    {match.kind === 'COMMITTED_GIFT'
                      ? 'Committed gift'
                      : 'Staged gift'}{' '}
                    · {match.giftDate} ·{' '}
                    {formatAmountMicros(match.amountMicros, match.currencyCode)}
                  </span>
                  <span style={secondaryTextStyle}>
                    {match.status ?? 'Status unavailable'}
                    {match.giftBatchName ? ` · Batch: ${match.giftBatchName}` : ''}
                  </span>
                </div>
              ),
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              title="Create anyway"
              variant="secondary"
              onClick={() => {
                void handleSubmit(true);
              }}
              disabled={submitting}
            />
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button
          title="Cancel"
          variant="secondary"
          onClick={() => {
            void closeSidePanel();
          }}
          disabled={submitting}
        />
        <Button
          title={submitting ? 'Creating...' : 'Create gift'}
          variant="primary"
          accent="blue"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={submitting}
        />
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'new-gift',
  description: 'Creates a gift through manual entry.',
  component: NewGift,
});
