import { Callout } from 'twenty-ui/components/feedback';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Button } from 'twenty-ui/primitives/input';
import {
  ActionButton,
  actionRowStyle,
} from 'src/front-components/front-component-ui';
import {
  ChoiceCards,
  FormCheckbox,
  FormInput,
} from 'src/front-components/form-controls';
import type { NewGiftController } from 'src/manual-gift-entry/new-gift-section.types';
import {
  bodyTextStyle,
  buildCompanyDisplayName,
  buildOpportunityDisplayName,
  buildPersonDisplayName,
  fieldActionGridStyle,
  fieldGridStyle,
  inlineMatchSectionStyle,
  secondaryChoiceRowStyle,
  secondaryTextStyle,
  sectionHeaderRowStyle,
  sectionStyle,
  sectionTitleStyle,
  stackedSectionStyle,
} from 'src/manual-gift-entry/new-gift-support';

const DONOR_TYPE_OPTIONS = [
  { label: 'Individual', value: 'INDIVIDUAL' },
  { label: 'Company', value: 'COMPANY' },
] as const;

const FULL_WIDTH_FIELD_STYLE = { gridColumn: '1 / -1' };

const emailOrPlaceholder = (email: string | null | undefined) =>
  email?.trim() || 'No email on record';

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
        <SegmentedControl
          aria-label="Donor type"
          size="sm"
          value={donorType}
          onValueChange={(value) => setDonorType(value)}
          options={DONOR_TYPE_OPTIONS}
        />
      </div>

      {donorType === 'INDIVIDUAL' ? (
        <>
          <FormCheckbox
            label="Record as anonymous gift"
            checked={isAnonymousDonor}
            onChange={setIsAnonymousDonor}
          />

          {isAnonymousDonor ? (
            <Callout
              status="neutral"
              title="Anonymous donor"
              description="This gift will be recorded without linking or creating a donor. Gift Aid and recurring linkage are not available for anonymous gifts."
            />
          ) : (
            <>
              <div style={fieldGridStyle}>
                <FormInput
                  label="First name"
                  value={donorFirstName}
                  onChange={setDonorFirstName}
                />
                <FormInput
                  label="Last name"
                  value={donorLastName}
                  onChange={setDonorLastName}
                />
              </div>
              <FormInput
                label="Email"
                type="email"
                value={donorEmail}
                onChange={setDonorEmail}
              />
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
                <Callout
                  status="neutral"
                  title="Selected donor"
                  description={`${buildPersonDisplayName(selectedDonorSummary)} · ${emailOrPlaceholder(selectedDonorSummary.emails?.primaryEmail)}`}
                  action={
                    <Callout.Action
                      onClick={() => {
                        setSelectedDonorId(null);
                        setDonorChoice(null);
                      }}
                    >
                      Change
                    </Callout.Action>
                  }
                />
              ) : (
                <>
                  <ChoiceCards
                    ariaLabel="Possible existing donors"
                    value={selectedDonorId}
                    onChange={(candidateId) => {
                      setSelectedDonorId(candidateId);
                      setDonorChoice('USE_EXISTING');
                    }}
                    options={duplicateResult.candidates.map((candidate) => ({
                      value: candidate.id,
                      title: buildPersonDisplayName(candidate),
                      description: emailOrPlaceholder(
                        candidate.emails?.primaryEmail,
                      ),
                    }))}
                  />
                  <div style={secondaryChoiceRowStyle}>
                    <span style={secondaryTextStyle}>
                      No suitable donor listed?
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setSelectedDonorId(null);
                        setDonorChoice('CREATE_NEW');
                      }}
                    >
                      Create new donor
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {!isAnonymousDonor ? (
            <div style={stackedSectionStyle}>
              <FormCheckbox
                label="Add donor address"
                checked={includeDonorAddress}
                onChange={setIncludeDonorAddress}
              />

              {includeDonorAddress ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  <p style={bodyTextStyle}>
                    Address is only used if this gift creates a new donor.
                    Existing donor addresses are not updated in this flow.
                  </p>
                  <div style={fieldGridStyle}>
                    <FormInput
                      label="Address line 1"
                      value={addressStreet1}
                      onChange={setAddressStreet1}
                      style={FULL_WIDTH_FIELD_STYLE}
                    />
                    <FormInput
                      label="Address line 2"
                      value={addressStreet2}
                      onChange={setAddressStreet2}
                      style={FULL_WIDTH_FIELD_STYLE}
                    />
                    <FormInput
                      label="City"
                      value={addressCity}
                      onChange={setAddressCity}
                    />
                    <FormInput
                      label="County / state"
                      value={addressState}
                      onChange={setAddressState}
                    />
                    <FormInput
                      label="Postcode"
                      value={addressPostcode}
                      onChange={setAddressPostcode}
                    />
                    <FormInput
                      label="Country"
                      value={addressCountry}
                      onChange={setAddressCountry}
                    />
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

  const clearOpportunity = () => {
    setLinkOpportunity(false);
    setOpportunitySearchQuery('');
    setOpportunityResults([]);
    setSelectedOpportunityId(null);
  };

  return (
    <>
      <FormInput
        label="Company name"
        value={companyName}
        onChange={setCompanyName}
        description="Search first to avoid creating a duplicate company record."
      />

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
        <Callout
          status="neutral"
          title="Selected company"
          description={buildCompanyDisplayName(selectedCompanySummary)}
          action={
            <Callout.Action
              onClick={() => {
                setSelectedCompanyId(null);
                setCompanyChoice(null);
                clearOpportunity();
              }}
            >
              Change
            </Callout.Action>
          }
        />
      ) : null}

      {companyChoice === 'CREATE_NEW' ? (
        <Callout
          status="neutral"
          title="New company"
          description={`${companyName.trim()} · This gift will create a new company record.`}
          action={
            <Callout.Action
              onClick={() => {
                setCompanyChoice(null);
                setLinkOpportunity(false);
              }}
            >
              Change
            </Callout.Action>
          }
        />
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
            <ChoiceCards
              ariaLabel="Possible company matches"
              value={selectedCompanyId}
              onChange={(candidateId) => {
                setSelectedCompanyId(candidateId);
                setCompanyChoice('USE_EXISTING');
                clearOpportunity();
              }}
              options={companyResults.map((candidate) => ({
                value: candidate.id,
                title: buildCompanyDisplayName(candidate),
              }))}
            />
          ) : null}

          <div style={secondaryChoiceRowStyle}>
            <span style={secondaryTextStyle}>No suitable company listed?</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSelectedCompanyId(null);
                setCompanyChoice('CREATE_NEW');
                clearOpportunity();
              }}
            >
              Create new company
            </Button>
          </div>
        </div>
      ) : null}

      <div style={stackedSectionStyle}>
        <FormCheckbox
          label="Link an opportunity"
          checked={canLinkOpportunity && linkOpportunity}
          disabled={!canLinkOpportunity}
          onChange={(checked) => {
            if (!canLinkOpportunity) {
              return;
            }

            if (checked) {
              setLinkOpportunity(true);
            } else {
              clearOpportunity();
            }
          }}
        />

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
              <FormInput
                label="Search opportunities"
                value={opportunitySearchQuery}
                placeholder={
                  selectedCompanyId
                    ? 'Opportunity name'
                    : 'Opportunity name (searches all companies)'
                }
                onChange={setOpportunitySearchQuery}
              />
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
              <ChoiceCards
                ariaLabel="Opportunities"
                value={selectedOpportunityId}
                onChange={setSelectedOpportunityId}
                options={opportunityResults.map((opportunity) => ({
                  value: opportunity.id,
                  title: buildOpportunityDisplayName(opportunity),
                }))}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </>
  );
};
