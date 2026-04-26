import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  closeSidePanel,
  defineFrontComponent,
  enqueueSnackbar,
} from 'twenty-sdk';
import {
  Button,
  H2Title,
  Tag,
  ThemeProvider,
} from 'twenty-sdk/ui';
import {
  checkDonorDuplicates,
  createManualGift,
} from 'src/manual-gift-entry/manual-gift-entry.api';
import type { ManualGiftDonorChoice } from 'src/manual-gift-entry/manual-gift-entry.types';
import type {
  DonorDuplicateCheckResult,
  PersonSummary,
} from 'src/staging-review/staging-review.types';

export const NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f252fa83-8969-42cd-a8d2-b5b7496a8f34';

const NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER =
  'ac1ab30d-9939-48f1-a4b1-afcb6e768d46';

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

const labelStyle: CSSProperties = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#57606a',
};

const inputStyle: CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '6px',
  padding: '10px 12px',
  font: 'inherit',
  background: '#ffffff',
};

const buttonBaseStyle: CSSProperties = {
  borderRadius: '6px',
  padding: '10px 14px',
  font: 'inherit',
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  border: '1px solid #d0d7de',
  background: '#ffffff',
  color: '#1f2328',
};

const choiceButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  textAlign: 'left',
  display: 'grid',
  gap: '4px',
  width: '100%',
};

const selectedChoiceButtonStyle: CSSProperties = {
  ...choiceButtonStyle,
  border: '1px solid #1f6feb',
  background: '#eef4ff',
};

const secondaryTextStyle: CSSProperties = {
  fontSize: '13px',
  color: '#57606a',
  lineHeight: 1.5,
};

const getEventDetailValue = (event: unknown) => {
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

const buildPersonDisplayName = (person: PersonSummary) => {
  const firstName = person.name?.firstName?.trim() ?? '';
  const lastName = person.name?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'Unknown donor' : fullName;
};

const normalizeName = (value: string) => value.trim();
const isGiftAidEnabled =
  (process.env.GIFT_AID_ENABLED ?? 'true').toLowerCase() === 'true';

const ManualGiftEntry = () => {
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
  const [duplicateResult, setDuplicateResult] =
    useState<DonorDuplicateCheckResult | null>(null);
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

  const duplicateInterruptionVisible = useMemo(() => {
    return (
      duplicateResult !== null &&
      duplicateResult.status !== 'NO_MATCH'
    );
  }, [duplicateResult]);

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

    let activeDuplicateResult = duplicateResult;

    try {
      if (!activeDuplicateResult) {
        activeDuplicateResult = await runDuplicateCheck();
      }

      if (activeDuplicateResult.status !== 'NO_MATCH') {
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
            message: 'Select the existing donor to use for this gift.',
            variant: 'warning',
          });
          return;
        }
      }

      const effectiveChoice: ManualGiftDonorChoice =
        activeDuplicateResult.status === 'NO_MATCH'
          ? 'CREATE_NEW'
          : (donorChoice as ManualGiftDonorChoice);

      setSubmitting(true);

      const result = await createManualGift({
        donorFirstName: trimmedFirstName,
        donorLastName: trimmedLastName,
        donorEmail: donorEmail.trim(),
        amountValue: amountValue.trim(),
        giftDate: giftDate.trim(),
        giftAidRequested,
        giftAidDeclarationCaptured,
        giftAidDeclarationDate: giftAidDeclarationDate.trim(),
        giftAidCoverageScope: giftAidCoverageScope.trim(),
        giftAidDeclarationSource: giftAidDeclarationSource.trim(),
        giftAidTextVersion: giftAidTextVersion.trim(),
        donorChoice: effectiveChoice,
        selectedDonorId: selectedDonorId ?? undefined,
      });

      await enqueueSnackbar({
        message: result.giftId
          ? `Gift created (${result.giftId}).`
          : 'Gift created.',
        variant: 'success',
      });

      await closeSidePanel();
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Gift creation failed.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider colorScheme="light">
      <div style={panelStyle}>
        <div style={cardStyle}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={labelStyle}>Direct entry</div>
            <H2Title
              title="New gift"
              description="Capture the donor and gift basics, then interrupt save if the donor looks like an existing record."
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tag
                color={isGiftAidEnabled ? 'green' : 'gray'}
                text={isGiftAidEnabled ? 'Gift Aid enabled' : 'Gift Aid disabled'}
                variant="solid"
              />
              <Tag color="blue" text="Twenty UI probe" variant="outline" />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#1f2328' }}>Donor basics</div>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                value={donorFirstName}
                onChange={(event) => setDonorFirstName(getEventDetailValue(event))}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={labelStyle}>Last name</label>
              <input
                type="text"
                value={donorLastName}
                onChange={(event) => setDonorLastName(getEventDetailValue(event))}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gap: '6px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={donorEmail}
              onChange={(event) => setDonorEmail(getEventDetailValue(event))}
              style={inputStyle}
            />
          </div>
          <div>
            <Button
              title={
                checkingDuplicates ? 'Checking...' : 'Check donor duplicates'
              }
              variant="secondary"
              onClick={() => void handleExplicitDuplicateCheck()}
              disabled={!canCheckDuplicates || checkingDuplicates || submitting}
            />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ ...labelStyle, color: '#1f2328' }}>Gift basics</div>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={labelStyle}>Amount</label>
              <input
                type="text"
                value={amountValue}
                onChange={(event) => setAmountValue(getEventDetailValue(event))}
                style={inputStyle}
                placeholder="25.00"
              />
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
              <label style={labelStyle}>Gift date</label>
              <input
                type="date"
                value={giftDate}
                onChange={(event) => setGiftDate(getEventDetailValue(event))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {isGiftAidEnabled ? (
          <div style={cardStyle}>
            <div style={{ ...labelStyle, color: '#1f2328' }}>
              Gift Aid
            </div>
            <div style={secondaryTextStyle}>
              Capture whether Gift Aid was requested and, if known, the minimum
              declaration facts needed for later evaluation.
            </div>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={giftAidRequested}
                onChange={() => setGiftAidRequested((value) => !value)}
              />
              <span>Gift Aid requested for this gift</span>
            </label>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={giftAidDeclarationCaptured}
                onChange={() =>
                  setGiftAidDeclarationCaptured((value) => !value)
                }
              />
              <span>Declaration captured in this flow</span>
            </label>
            {giftAidDeclarationCaptured ? (
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  gridTemplateColumns: '1fr 1fr',
                }}
              >
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label style={labelStyle}>Declaration date</label>
                  <input
                    type="date"
                    value={giftAidDeclarationDate}
                    onChange={(event) =>
                      setGiftAidDeclarationDate(getEventDetailValue(event))
                    }
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label style={labelStyle}>Coverage scope</label>
                  <input
                    type="text"
                    value={giftAidCoverageScope}
                    onChange={(event) =>
                      setGiftAidCoverageScope(getEventDetailValue(event))
                    }
                    style={inputStyle}
                    placeholder="past_and_future"
                  />
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label style={labelStyle}>Declaration source</label>
                  <input
                    type="text"
                    value={giftAidDeclarationSource}
                    onChange={(event) =>
                      setGiftAidDeclarationSource(getEventDetailValue(event))
                    }
                    style={inputStyle}
                    placeholder="manual_entry"
                  />
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  <label style={labelStyle}>Text version</label>
                  <input
                    type="text"
                    value={giftAidTextVersion}
                    onChange={(event) =>
                      setGiftAidTextVersion(getEventDetailValue(event))
                    }
                    style={inputStyle}
                    placeholder="v1"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {duplicateInterruptionVisible ? (
          <div style={cardStyle}>
            <div style={{ ...labelStyle, color: '#1f2328' }}>
              Donor duplicate interruption
            </div>
            <div style={secondaryTextStyle}>
              {duplicateResult?.status === 'SINGLE_EXACT_MATCH'
                ? 'One existing donor exactly matches this name. Choose whether to use that donor or continue as a new donor.'
                : 'Multiple existing donors exactly match this name. Pick the donor explicitly or continue as a new donor.'}
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
              {duplicateResult?.candidates.map((candidate) => {
                const selected = selectedDonorId === candidate.id;

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    style={
                      selected
                        ? selectedChoiceButtonStyle
                        : choiceButtonStyle
                    }
                    onClick={() => {
                      setSelectedDonorId(candidate.id);
                      setDonorChoice('USE_EXISTING');
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {buildPersonDisplayName(candidate)}
                    </span>
                    <span style={secondaryTextStyle}>
                      {candidate.emails?.primaryEmail ?? 'No email on donor'}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              style={
                donorChoice === 'CREATE_NEW'
                  ? selectedChoiceButtonStyle
                  : choiceButtonStyle
              }
              onClick={() => {
                setSelectedDonorId(null);
                setDonorChoice('CREATE_NEW');
              }}
            >
              <span style={{ fontWeight: 600 }}>Create new donor</span>
              <span style={secondaryTextStyle}>
                Continue with a new donor using the entered name and email.
              </span>
            </button>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            title="Cancel"
            variant="secondary"
            onClick={() => void closeSidePanel()}
            disabled={submitting}
          />
          <Button
            title={submitting ? 'Creating...' : 'Create gift'}
            accent="blue"
            onClick={() => void handleSubmit()}
            disabled={checkingDuplicates || submitting}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: NEW_GIFT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'manual-gift-entry',
  description:
    'Direct manual gift entry with donor duplicate interruption before commit.',
  component: ManualGiftEntry,
  command: {
    universalIdentifier: NEW_GIFT_COMMAND_UNIVERSAL_IDENTIFIER,
    label: 'New gift',
    shortLabel: 'New gift',
    icon: 'IconGift',
    isPinned: true,
    availabilityType: 'GLOBAL',
  },
});
