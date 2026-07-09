import {
  ActionButton,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  bodyTextStyle,
  buildCompanyDisplayName,
  buildOpportunityDisplayName,
  buildPersonDisplayName,
  candidateButtonStyle,
  checkboxLabelStyle,
  compactMatchActionStyle,
  compactMatchInfoStyle,
  compactTextActionStyle,
  fieldActionGridStyle,
  fieldGridStyle,
  fieldStyle,
  getInputEventChecked,
  getInputEventValue,
  inlineMatchSectionStyle,
  inputStyle,
  labelStyle,
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
  stackedSectionStyle,
} from 'src/manual-gift-entry/new-gift-support';

export const DonorContextSection = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const {
    donorType,
    setDonorType,
    donorFirstName,
    setDonorFirstName,
    donorLastName,
    setDonorLastName,
    donorEmail,
    setDonorEmail,
    isAnonymousDonor,
    setIsAnonymousDonor,
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
    duplicateResult,
    donorChoice,
    setDonorChoice,
    selectedDonorId,
    setSelectedDonorId,
    duplicateInterruptionVisible,
    selectedDonorSummary,
  } = controller;

  return (
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
          <div style={stackedSectionStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={isAnonymousDonor}
                onChange={(event) =>
                  setIsAnonymousDonor(getInputEventChecked(event))
                }
              />
              <span>Record as anonymous gift</span>
            </label>
          </div>

          {isAnonymousDonor ? (
            <div style={selectedSummaryStyle}>
              <div style={selectedStateInfoStyle}>
                <div style={sectionTitleStyle}>Anonymous donor</div>
                <span style={secondaryTextStyle}>
                  This gift will be recorded without linking or creating a
                  donor. Gift Aid and recurring linkage are not available for
                  anonymous gifts.
                </span>
              </div>
            </div>
          ) : (
            <>
              <div style={fieldGridStyle}>
                <label style={fieldStyle}>
                  <span style={labelStyle}>First name</span>
                  <input
                    style={inputStyle}
                    value={donorFirstName}
                    onChange={(event) =>
                      setDonorFirstName(getInputEventValue(event))
                    }
                  />
                </label>

                <label style={fieldStyle}>
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

              <label style={fieldStyle}>
                <span style={labelStyle}>Email</span>
                <input
                  style={inputStyle}
                  type="email"
                  value={donorEmail}
                  onChange={(event) => setDonorEmail(getInputEventValue(event))}
                />
              </label>
            </>
          )}

          {!isAnonymousDonor &&
          duplicateInterruptionVisible &&
          duplicateResult ? (
            <div style={inlineMatchSectionStyle}>
              <div style={sectionTitleStyle}>Donor match</div>
              <div style={secondaryTextStyle}>
                {duplicateResult.status === 'SINGLE_EXACT_MATCH'
                  ? 'We found one possible existing donor. Use that donor or continue with a new donor.'
                  : 'We found more than one possible existing donor. Choose the right donor or continue with a new donor.'}
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
                  <div style={stackedSectionStyle}>
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

          {!isAnonymousDonor ? (
            <div style={stackedSectionStyle}>
              <label style={checkboxLabelStyle}>
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
                  <div style={fieldGridStyle}>
                    <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <span style={labelStyle}>Address line 1</span>
                      <input
                        style={inputStyle}
                        value={addressStreet1}
                        onChange={(event) =>
                          setAddressStreet1(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                      <span style={labelStyle}>Address line 2</span>
                      <input
                        style={inputStyle}
                        value={addressStreet2}
                        onChange={(event) =>
                          setAddressStreet2(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={fieldStyle}>
                      <span style={labelStyle}>City</span>
                      <input
                        style={inputStyle}
                        value={addressCity}
                        onChange={(event) =>
                          setAddressCity(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={fieldStyle}>
                      <span style={labelStyle}>County / state</span>
                      <input
                        style={inputStyle}
                        value={addressState}
                        onChange={(event) =>
                          setAddressState(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={fieldStyle}>
                      <span style={labelStyle}>Postcode</span>
                      <input
                        style={inputStyle}
                        value={addressPostcode}
                        onChange={(event) =>
                          setAddressPostcode(getInputEventValue(event))
                        }
                      />
                    </label>

                    <label style={fieldStyle}>
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
          ) : null}
        </>
      ) : (
        <CompanyDonorContext controller={controller} />
      )}
    </div>
  );
};

const CompanyDonorContext = ({
  controller,
}: {
  controller: NewGiftController;
}) => {
  const {
    companyName,
    setCompanyName,
    companyResults,
    companySearchPerformed,
    searchingCompanies,
    companyChoice,
    setCompanyChoice,
    selectedCompanyId,
    setSelectedCompanyId,
    linkOpportunity,
    setLinkOpportunity,
    opportunitySearchQuery,
    setOpportunitySearchQuery,
    opportunityResults,
    setOpportunityResults,
    selectedOpportunityId,
    setSelectedOpportunityId,
    searchingOpportunities,
    selectedCompanySummary,
    canSearchCompanies,
    canSearchOpportunities,
    submitting,
    handleSearchCompanies,
    handleSearchOpportunities,
  } = controller;
  const canLinkOpportunity =
    companyChoice === 'USE_EXISTING' && Boolean(selectedCompanyId);

  return (
    <>
      <label style={fieldStyle}>
        <span style={labelStyle}>Company name</span>
        <input
          style={inputStyle}
          value={companyName}
          onChange={(event) => setCompanyName(getInputEventValue(event))}
        />
      </label>
      <p style={bodyTextStyle}>
        Search first to avoid creating a duplicate company record.
      </p>

      <div style={actionRowStyle}>
        <ActionButton
          title={searchingCompanies ? 'Searching...' : 'Search companies'}
          variant="secondary"
          onClick={() => {
            void handleSearchCompanies();
          }}
          disabled={searchingCompanies || submitting || !canSearchCompanies}
        />
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
              setLinkOpportunity(false);
              setOpportunitySearchQuery('');
              setOpportunityResults([]);
              setSelectedOpportunityId(null);
            }}
          >
            Change
          </button>
        </div>
      ) : null}

      {companyChoice === 'CREATE_NEW' ? (
        <div style={selectedSummaryStyle}>
          <div style={selectedStateInfoStyle}>
            <div style={sectionTitleStyle}>New company</div>
            <strong>{companyName.trim()}</strong>
            <span style={secondaryTextStyle}>
              This gift will create a new company record.
            </span>
          </div>
          <button
            type="button"
            style={compactTextActionStyle}
            onClick={() => {
              setCompanyChoice(null);
              setLinkOpportunity(false);
            }}
          >
            Change
          </button>
        </div>
      ) : null}

      {companySearchPerformed && companyChoice !== 'USE_EXISTING' ? (
        <div style={inlineMatchSectionStyle}>
          <div style={sectionTitleStyle}>Possible company matches</div>
          <div style={secondaryTextStyle}>
            {companyResults.length === 0
              ? 'No existing companies matched this search. Create a new company only if this organisation is not already in the CRM.'
              : 'Choose an existing company if one of these is the same organisation.'}
          </div>

          {companyResults.length > 0 ? (
            <div style={stackedSectionStyle}>
              {companyResults.map((candidate) => {
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
                      setLinkOpportunity(false);
                      setOpportunitySearchQuery('');
                      setOpportunityResults([]);
                      setSelectedOpportunityId(null);
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
          ) : null}

          <div style={secondaryChoiceRowStyle}>
            <span style={secondaryTextStyle}>No suitable company listed?</span>
            <button
              type="button"
              style={compactTextActionStyle}
              onClick={() => {
                setSelectedCompanyId(null);
                setCompanyChoice('CREATE_NEW');
                setLinkOpportunity(false);
                setOpportunitySearchQuery('');
                setOpportunityResults([]);
                setSelectedOpportunityId(null);
              }}
            >
              Create new company
            </button>
          </div>
        </div>
      ) : null}

      <div style={stackedSectionStyle}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            checked={canLinkOpportunity && linkOpportunity}
            disabled={!canLinkOpportunity}
            onChange={(event) => {
              if (!canLinkOpportunity) {
                return;
              }

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

        {!canLinkOpportunity ? (
          <p style={bodyTextStyle}>
            Select an existing company before linking an opportunity.
          </p>
        ) : null}

        {canLinkOpportunity && linkOpportunity ? (
          <>
            <p style={bodyTextStyle}>
              Add an opportunity when this gift relates to a grant, sponsorship,
              or similar company gift.
            </p>

            <div style={fieldActionGridStyle}>
              <label style={fieldStyle}>
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
                <ActionButton
                  title={searchingOpportunities ? 'Searching...' : 'Search'}
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
              <div style={stackedSectionStyle}>
                {opportunityResults.map((opportunity) => {
                  const isSelected = opportunity.id === selectedOpportunityId;

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
                      <strong>{buildOpportunityDisplayName(opportunity)}</strong>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
};
