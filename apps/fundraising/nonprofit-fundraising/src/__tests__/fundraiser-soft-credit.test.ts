import { describe, expect, it } from 'vitest';
import {
  deriveFundraiserSoftCreditSelection,
  isFundraiserSoftCreditDerivedFromAppealSource,
} from 'src/soft-credits/fundraiser-soft-credit';

describe('fundraiser soft credit derivation', () => {
  it('derives FUNDRAISER soft credit from the next appeal source fundraiser when no explicit soft credit is provided', () => {
    const resolved = deriveFundraiserSoftCreditSelection({
      currentSoftCredit: {
        softCreditPersonId: '',
        softCreditCompanyId: '',
        softCreditType: '',
      },
      requestedSoftCreditSelection: {
        mode: 'unchanged',
      },
      nextAppealSourceFundraiser: {
        fundraiserPersonId: 'person-1',
        fundraiserCompanyId: '',
      },
    });

    expect(resolved).toEqual({
      mode: 'set',
      softCreditPersonId: 'person-1',
      softCreditCompanyId: '',
      softCreditType: 'FUNDRAISER',
    });
  });

  it('clears a previously derived FUNDRAISER soft credit when the next appeal source has no linked fundraiser', () => {
    const resolved = deriveFundraiserSoftCreditSelection({
      currentSoftCredit: {
        softCreditPersonId: 'person-1',
        softCreditCompanyId: '',
        softCreditType: 'FUNDRAISER',
      },
      currentAppealSourceFundraiser: {
        fundraiserPersonId: 'person-1',
        fundraiserCompanyId: '',
      },
      requestedSoftCreditSelection: {
        mode: 'unchanged',
      },
      nextAppealSourceFundraiser: {
        fundraiserPersonId: '',
        fundraiserCompanyId: '',
      },
    });

    expect(resolved).toEqual({
      mode: 'clear',
      softCreditPersonId: '',
      softCreditCompanyId: '',
      softCreditType: '',
    });
  });

  it('keeps an unrelated existing soft credit unchanged when the next appeal source has no linked fundraiser', () => {
    const resolved = deriveFundraiserSoftCreditSelection({
      currentSoftCredit: {
        softCreditPersonId: 'person-2',
        softCreditCompanyId: '',
        softCreditType: 'INTRODUCER',
      },
      currentAppealSourceFundraiser: {
        fundraiserPersonId: 'person-1',
        fundraiserCompanyId: '',
      },
      requestedSoftCreditSelection: {
        mode: 'unchanged',
      },
      nextAppealSourceFundraiser: {
        fundraiserPersonId: '',
        fundraiserCompanyId: '',
      },
    });

    expect(resolved).toEqual({
      mode: 'unchanged',
    });
  });

  it('respects explicit soft credit input even when the next appeal source has a linked fundraiser', () => {
    const resolved = deriveFundraiserSoftCreditSelection({
      currentSoftCredit: {
        softCreditPersonId: '',
        softCreditCompanyId: '',
        softCreditType: '',
      },
      requestedSoftCreditSelection: {
        mode: 'set',
        softCreditPersonId: 'person-2',
        softCreditCompanyId: '',
        softCreditType: 'INTRODUCER',
      },
      nextAppealSourceFundraiser: {
        fundraiserPersonId: 'person-1',
        fundraiserCompanyId: '',
      },
    });

    expect(resolved).toEqual({
      mode: 'set',
      softCreditPersonId: 'person-2',
      softCreditCompanyId: '',
      softCreditType: 'INTRODUCER',
    });
  });

  it('recognises when a FUNDRAISER soft credit is derived from an appeal source company fundraiser', () => {
    expect(
      isFundraiserSoftCreditDerivedFromAppealSource({
        softCredit: {
          softCreditPersonId: '',
          softCreditCompanyId: 'company-1',
          softCreditType: 'FUNDRAISER',
        },
        appealSourceFundraiser: {
          fundraiserPersonId: '',
          fundraiserCompanyId: 'company-1',
        },
      }),
    ).toBe(true);
  });
});
