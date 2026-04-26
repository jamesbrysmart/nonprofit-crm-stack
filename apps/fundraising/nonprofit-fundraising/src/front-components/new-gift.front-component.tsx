import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { closeSidePanel, enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  checkDonorDuplicates,
  createManualGift,
  searchRecurringAgreements,
} from 'src/manual-gift-entry/manual-gift-entry.api';
import type {
  DuplicateCheckResponse,
  ManualGiftDonorChoice,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import type { RecurringAgreementSummary } from 'src/recurring/recurring.types';

export const NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'c813555c-eec2-42df-a29b-cd8817e0f4d6';

const NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER =
  'ef13b0da-7934-47cf-b09b-57a67695756d';

const panelStyle: CSSProperties = {
  padding: '20px',
  fontFamily: 'sans-serif',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const cardStyle: CSSProperties = {
  border: '1px solid #d8dee4',
  borderRadius: '10px',
  padding: '16px',
  display: 'grid',
  gap: '12px',
  background: '#ffffff',
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: '20px',
  color: '#1f2328',
};

const bodyTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: '#57606a',
  lineHeight: 1.5,
};

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const sectionTitleStyle: CSSProperties = {
  ...labelStyle,
  color: '#1f2328',
};

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

const candidateButtonStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #d0d7de',
  borderRadius: '8px',
  padding: '12px',
  textAlign: 'left',
  background: '#ffffff',
  cursor: 'pointer',
  display: 'grid',
  gap: '4px',
};

const selectedCandidateButtonStyle: CSSProperties = {
  ...candidateButtonStyle,
  border: '1px solid #1f6feb',
  background: '#eef4ff',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const selectedCreateNewStyle: CSSProperties = {
  ...selectedCandidateButtonStyle,
  padding: '14px 12px',
};

const createNewChoiceStyle: CSSProperties = {
  ...candidateButtonStyle,
  padding: '14px 12px',
};

const buildPersonDisplayName = (person: PersonSummary) => {
  const firstName = person.name?.firstName?.trim() ?? '';
  const lastName = person.name?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'Unknown donor' : fullName;
};

const buildRecurringAgreementDisplayName = (
  agreement: RecurringAgreementSummary,
) => {
  const donorFirstName = agreement.person?.name?.firstName?.trim() ?? '';
  const donorLastName = agreement.person?.name?.lastName?.trim() ?? '';
  const donorName = `${donorFirstName} ${donorLastName}`.trim();

  return donorName === '' ? agreement.name : `${agreement.name} · ${donorName}`;
};

const normalizeName = (value: string) => value.trim();
const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'true').toLowerCase() === 'true';

const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  return '';
};

const getInputEventChecked = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'checked' in event.detail
  ) {
    return Boolean(event.detail.checked);
  }

  return false;
};

const NewGift = () => {
  const [donorFirstName, setDonorFirstName] = useState('');
  const [donorLastName, setDonorLastName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amountValue, setAmountValue] = useState('');
  const [giftDate, setGiftDate] = useState('');
  const [giftAidRequested, setGiftAidRequested] = useState(false);
  const [giftAidDeclarationCaptured, setGiftAidDeclarationCaptured] =
    useState(false);
  const [giftAidDeclarationDate, setGiftAidDeclarationDate] = useState('');
  const [giftAidCoverageScope, setGiftAidCoverageScope] = useState('');
  const [giftAidDeclarationSource, setGiftAidDeclarationSource] = useState('');
  const [giftAidTextVersion, setGiftAidTextVersion] = useState('');
  const [linkRecurringAgreement, setLinkRecurringAgreement] = useState(false);
  const [recurringSearchQuery, setRecurringSearchQuery] = useState('');
  const [recurringResults, setRecurringResults] = useState<
    RecurringAgreementSummary[]
  >([]);
  const [selectedRecurringAgreementId, setSelectedRecurringAgreementId] =
    useState<string | null>(null);
  const [searchingRecurring, setSearchingRecurring] = useState(false);
  const [duplicateResult, setDuplicateResult] =
    useState<DuplicateCheckResponse | null>(null);
  const [donorChoice, setDonorChoice] =
    useState<ManualGiftDonorChoice | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDuplicateResult(null);
    setDonorChoice(null);
    setSelectedDonorId(null);
  }, [donorFirstName, donorLastName]);

  const trimmedFirstName = normalizeName(donorFirstName);
  const trimmedLastName = normalizeName(donorLastName);
  const canCheckDuplicates =
    trimmedFirstName.length > 0 && trimmedLastName.length > 0;
  const canSearchRecurring = recurringSearchQuery.trim().length >= 2;

  const duplicateInterruptionVisible = useMemo(
    () => duplicateResult !== null && duplicateResult.status !== 'NO_MATCH',
    [duplicateResult],
  );

  const runDuplicateCheck = async () => {
    if (!canCheckDuplicates) {
      throw new Error('Enter donor first name and last name first');
    }

    setCheckingDuplicates(true);

    try {
      const result = await checkDonorDuplicates({
        donorFirstName: trimmedFirstName,
        donorLastName: trimmedLastName,
      });

      setDuplicateResult(result);

      return result;
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleExplicitDuplicateCheck = async () => {
    try {
      const result = await runDuplicateCheck();
      const message =
        result.status === 'NO_MATCH'
          ? 'No exact donor duplicates found.'
          : result.status === 'SINGLE_EXACT_MATCH'
            ? 'One exact donor match found. Choose whether to use it or create a new donor.'
            : 'Multiple exact donor matches found. Choose the donor explicitly before saving.';

      await enqueueSnackbar({
        message,
        variant: 'info',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to check donor duplicates.',
        variant: 'error',
      });
    }
  };

  const handleSubmit = async () => {
    if (
      trimmedFirstName === '' ||
      trimmedLastName === '' ||
      amountValue.trim() === '' ||
      giftDate.trim() === ''
    ) {
      await enqueueSnackbar({
        message:
          'Enter donor first name, donor last name, amount, and gift date.',
        variant: 'warning',
      });
      return;
    }

    if (linkRecurringAgreement && !selectedRecurringAgreementId) {
      await enqueueSnackbar({
        message: 'Select the recurring agreement to link before saving.',
        variant: 'warning',
      });
      return;
    }

    let activeDuplicateResult = duplicateResult;

    try {
      if (!activeDuplicateResult) {
        activeDuplicateResult = await runDuplicateCheck();
      }

      if (activeDuplicateResult.status !== 'NO_MATCH') {
        // Duplicate resolution stays explicit so operators choose the right
        // donor before manual entry creates a committed gift directly.
        if (donorChoice === null) {
          await enqueueSnackbar({
            message:
              'Choose whether to use an existing donor or create a new donor before saving.',
            variant: 'warning',
          });
          return;
        }

        if (donorChoice === 'USE_EXISTING' && !selectedDonorId) {
          await enqueueSnackbar({
            message: 'Select the donor to use before saving.',
            variant: 'warning',
          });
          return;
        }
      }

      const resolvedDonorChoice: ManualGiftDonorChoice =
        activeDuplicateResult.status === 'NO_MATCH'
          ? 'CREATE_NEW'
          : (donorChoice ?? 'CREATE_NEW');

      setSubmitting(true);

      await createManualGift({
        donorFirstName: trimmedFirstName,
        donorLastName: trimmedLastName,
        donorEmail: donorEmail.trim(),
        amountValue: amountValue.trim(),
        giftDate: giftDate.trim(),
        giftAidRequested,
        giftAidDeclarationCaptured,
        ...(giftAidDeclarationDate.trim() !== ''
          ? { giftAidDeclarationDate: giftAidDeclarationDate.trim() }
          : {}),
        ...(giftAidCoverageScope.trim() !== ''
          ? { giftAidCoverageScope: giftAidCoverageScope.trim() }
          : {}),
        ...(giftAidDeclarationSource.trim() !== ''
          ? { giftAidDeclarationSource: giftAidDeclarationSource.trim() }
          : {}),
        ...(giftAidTextVersion.trim() !== ''
          ? { giftAidTextVersion: giftAidTextVersion.trim() }
          : {}),
        donorChoice: resolvedDonorChoice,
        ...(resolvedDonorChoice === 'USE_EXISTING' && selectedDonorId
          ? { selectedDonorId }
          : {}),
        ...(linkRecurringAgreement && selectedRecurringAgreementId
          ? { selectedRecurringAgreementId }
          : {}),
      });

      await enqueueSnackbar({
        message: 'Gift created successfully.',
        variant: 'success',
      });
      await closeSidePanel();
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to create gift.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchRecurringAgreements = async () => {
    if (!canSearchRecurring) {
      await enqueueSnackbar({
        message: 'Enter at least two characters to search recurring agreements.',
        variant: 'warning',
      });
      return;
    }

    setSearchingRecurring(true);

    try {
      const result = await searchRecurringAgreements({
        query: recurringSearchQuery.trim(),
      });
      setRecurringResults(result.agreements);

      await enqueueSnackbar({
        message:
          result.agreements.length === 0
            ? 'No recurring agreements matched the current search.'
            : `Found ${result.agreements.length} recurring agreement${result.agreements.length === 1 ? '' : 's'}.`,
        variant: 'info',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Unable to search recurring agreements.',
        variant: 'error',
      });
    } finally {
      setSearchingRecurring(false);
    }
  };

  return (
    <div style={panelStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={labelStyle}>Direct entry</div>
          <h2 style={headingStyle}>New gift</h2>
          <p style={bodyTextStyle}>
            Manual entry creates a committed gift directly. If Twenty finds an
            exact donor duplicate, you resolve that explicitly before saving.
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Donor basics</div>
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

        <div>
          <Button
            title={checkingDuplicates ? 'Checking...' : 'Check donor duplicates'}
            variant="secondary"
            onClick={() => {
              void handleExplicitDuplicateCheck();
            }}
            disabled={!canCheckDuplicates || submitting || checkingDuplicates}
          />
        </div>
      </div>

      <div style={cardStyle}>
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
            <span style={labelStyle}>Gift date</span>
            <input
              style={inputStyle}
              type="date"
              value={giftDate}
              onChange={(event) => setGiftDate(getInputEventValue(event))}
            />
          </label>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Recurring linkage</div>
        <p style={bodyTextStyle}>
          Link this gift to an existing recurring agreement when it represents
          fulfillment against a known donor commitment. New agreement creation
          stays out of this flow for now.
        </p>

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
          <span>Link this gift to an existing recurring agreement</span>
        </label>

        {linkRecurringAgreement ? (
          <>
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
                  placeholder="Donor name, agreement name, provider reference"
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
                        {agreement.status ?? 'Unknown status'} ·{' '}
                        {agreement.nextExpectedAt ?? 'No next expected date'} ·{' '}
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

      {isGiftAidEnabled ? (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Gift Aid</div>
          <p style={bodyTextStyle}>
            Capture Gift Aid request and declaration facts here. The final
            claimability outcome is still derived on the committed gift.
          </p>

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
              checked={giftAidRequested}
              onChange={(event) => setGiftAidRequested(getInputEventChecked(event))}
            />
            <span>Gift Aid requested for this gift</span>
          </label>

          {giftAidRequested ? (
            <>
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
                  checked={giftAidDeclarationCaptured}
                  onChange={(event) =>
                    setGiftAidDeclarationCaptured(getInputEventChecked(event))
                  }
                />
                <span>Declaration captured in this entry flow</span>
              </label>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={labelStyle}>Declaration date</span>
                  <input
                    style={inputStyle}
                    type="date"
                    value={giftAidDeclarationDate}
                    onChange={(event) =>
                      setGiftAidDeclarationDate(getInputEventValue(event))
                    }
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={labelStyle}>Coverage scope</span>
                  <input
                    style={inputStyle}
                    value={giftAidCoverageScope}
                    placeholder="past_and_future"
                    onChange={(event) =>
                      setGiftAidCoverageScope(getInputEventValue(event))
                    }
                  />
                </label>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={labelStyle}>Declaration source</span>
                  <input
                    style={inputStyle}
                    value={giftAidDeclarationSource}
                    placeholder="manual_entry"
                    onChange={(event) =>
                      setGiftAidDeclarationSource(getInputEventValue(event))
                    }
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px' }}>
                  <span style={labelStyle}>Text version</span>
                  <input
                    style={inputStyle}
                    value={giftAidTextVersion}
                    placeholder="v1"
                    onChange={(event) =>
                      setGiftAidTextVersion(getInputEventValue(event))
                    }
                  />
                </label>
              </div>
            </>
          ) : (
            <div style={secondaryTextStyle}>
              Leave Gift Aid off when no request or declaration facts were
              captured during entry.
            </div>
          )}
        </div>
      ) : null}

      {duplicateInterruptionVisible && duplicateResult ? (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>Donor duplicate interruption</div>
          <div style={secondaryTextStyle}>
            {duplicateResult.status === 'SINGLE_EXACT_MATCH'
              ? 'One existing donor exactly matches this name. Choose whether to use that donor or continue as a new donor.'
              : 'Multiple existing donors exactly match this name. Pick the donor explicitly or continue as a new donor.'}
          </div>

          {donorChoice === 'USE_EXISTING' ? (
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
                    <strong>{buildPersonDisplayName(candidate)}</strong>
                    <span style={secondaryTextStyle}>
                      {email === undefined || email === ''
                        ? 'No primary email'
                        : email}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            type="button"
            style={
              donorChoice === 'CREATE_NEW'
                ? selectedCreateNewStyle
                : createNewChoiceStyle
            }
            onClick={() => {
              setSelectedDonorId(null);
              setDonorChoice('CREATE_NEW');
            }}
          >
            <strong>Create new donor</strong>
            <span style={secondaryTextStyle}>
              Continue with a new donor using the entered name and email.
            </span>
          </button>

          <div>
            <Button
              title="Use an existing donor"
              variant="secondary"
              onClick={() => setDonorChoice('USE_EXISTING')}
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
  description: 'Creates a committed gift through the trusted manual-entry flow.',
  component: NewGift,
  command: {
    universalIdentifier: NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'New gift',
    shortLabel: 'New gift',
    icon: 'IconGift',
    isPinned: true,
    availabilityType: 'GLOBAL',
  },
});
