import { describe, expect, it } from 'vitest';
import type { RecordGiftRefundResponse } from 'src/gift-lifecycle/gift-refund.types';
import type {
  DuplicateCheckResponse,
  ManualGiftDuplicateCheckResponse,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  callAppRoute,
  createCompany,
  createOpportunity,
  createRecurringAgreement,
  createPerson,
  getCoreClient,
  loadGiftById,
  loadPeopleByName,
} from './test-helpers';

describe('Manual gift entry routes', () => {
  it('records the gift against the explicitly selected donor when names match', async () => {
    const suffix = `${Date.now()}-existing`;
    const donorFirstName = `Ada${suffix}`;
    const donorLastName = 'Lovelace';
    const donorEmail = `ada.${suffix}@example.org`;

    const otherDonor = await createPerson({
      firstName: donorFirstName,
      lastName: donorLastName,
      email: `another.${suffix}@example.org`,
    });

    const duplicateInput = {
      donorFirstName: donorFirstName.toLowerCase(),
      donorLastName: donorLastName.toUpperCase(),
    };
    const checkDonors = () =>
      callAppRoute<DuplicateCheckResponse>(
        '/s/donor-resolution/check-donor-duplicates',
        duplicateInput,
      );
    const singleMatch = await checkDonors();
    expect(singleMatch.status).toBe('SINGLE_EXACT_MATCH');
    expect(singleMatch.candidates.map(({ id }) => id)).toEqual([otherDonor.id]);

    const selectedDonor = await createPerson({
      firstName: donorFirstName,
      lastName: donorLastName,
      email: donorEmail,
    });

    const multipleMatches = await checkDonors();
    expect(multipleMatches.status).toBe('MULTIPLE_EXACT_MATCHES');
    expect(multipleMatches.candidates.map(({ id }) => id).sort()).toEqual(
      [otherDonor.id, selectedDonor.id].sort(),
    );

    const giftDetails = {
      amountValue: '25.00',
      currencyCode: 'GBP',
      giftDate: '2026-04-21',
      selectedDonorId: selectedDonor.id,
    };

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        ...giftDetails,
        paymentType: 'BANK_TRANSFER',
        donorChoice: 'USE_EXISTING',
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorChoice).toBe('USE_EXISTING');

    const gift = await loadGiftById(response.giftId);
    expect(gift).toBeTruthy();
    expect(gift?.donor?.id).toBe(selectedDonor.id);
    expect(gift?.donorFirstName).toBe(donorFirstName);
    expect(gift?.donorLastName).toBe(donorLastName);
    expect(gift?.donorEmail).toBe(donorEmail);
    expect(gift?.amount).toEqual({
      amountMicros: 25_000_000,
      currencyCode: 'GBP',
    });

    const checkGift = (currencyCode: string) =>
      callAppRoute<ManualGiftDuplicateCheckResponse>(
        '/s/manual-gift-entry/check-duplicates',
        { ...giftDetails, currencyCode },
      );
    expect((await checkGift('GBP')).matches).toMatchObject([
      { kind: 'COMMITTED_GIFT', id: response.giftId },
    ]);
    expect((await checkGift('EUR')).matches).toEqual([]);
  });

  it('should create a new donor and linked gift when no duplicate exists', async () => {
    const suffix = `${Date.now()}-new`;
    const donorFirstName = `Morgan${suffix}`;
    const donorLastName = 'Pryce';
    const donorEmail = `morgan.${suffix}@example.org`;

    const duplicateResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      { donorFirstName, donorLastName },
    );
    expect(duplicateResult).toMatchObject({ status: 'NO_MATCH', candidates: [] });

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '18.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        provider: 'JustGiving',
        giftDate: '2026-04-21',
        donorChoice: 'CREATE_NEW',
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorChoice).toBe('CREATE_NEW');

    const gift = await loadGiftById(response.giftId);
    expect(gift).toBeTruthy();
    expect(gift?.donorFirstName).toBe(donorFirstName);
    expect(gift?.donorLastName).toBe(donorLastName);
    expect(gift?.donorEmail).toBe(donorEmail);
    expect(gift?.provider).toBe('JustGiving');
    expect(gift?.donor?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    expect(people).toHaveLength(1);
    expect(people[0]?.emails?.primaryEmail).toBe(donorEmail);
    expect(gift?.donor?.id).toBe(people[0]?.id);
  });

  it('should create an anonymous one-off gift without a donor link', async () => {
    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        isAnonymousDonor: true,
        amountValue: '12.00',
        currencyCode: 'GBP',
        paymentType: 'CASH',
        giftDate: '2026-04-21',
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorId ?? null).toBeNull();
    expect(response.isAnonymousDonor).toBe(true);

    const gift = await loadGiftById(response.giftId);
    expect(gift).toBeTruthy();
    expect(gift?.isAnonymousDonor).toBe(true);
    expect(gift?.donor?.id ?? null).toBeNull();
    expect(gift?.donorFirstName ?? '').toBe('');
    expect(gift?.donorLastName ?? '').toBe('');
  });

  it('should reject anonymous manual gifts linked to a recurring agreement', async () => {
    await expect(
      callAppRoute<ManualGiftEntryResponse>('/s/manual-gift-entry/create-gift', {
        isAnonymousDonor: true,
        amountValue: '12.00',
        currencyCode: 'GBP',
        paymentType: 'CASH',
        giftDate: '2026-04-21',
        selectedRecurringAgreementId: 'recurring_123',
      }),
    ).rejects.toThrow(
      'Anonymous donor gifts cannot be linked to recurring agreements',
    );
  });

  it('records a partial refund with Fundraising alone', async () => {
    const suffix = `${Date.now()}-refund`;
    const { giftId } = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName: 'Grace',
        donorLastName: suffix,
        donorEmail: `grace.${suffix}@example.org`,
        amountValue: '33.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
        donorChoice: 'CREATE_NEW',
      },
    );

    const refund = await callAppRoute<RecordGiftRefundResponse>(
      '/s/gifts/record-refund',
      { giftId, refundedAmountMicros: 10_000_000, refundDate: '2026-04-26' },
    );

    expect(refund.refundState).toBe('PARTIALLY_REFUNDED');
    expect(await loadGiftById(giftId)).toMatchObject({
      refundedAmount: { amountMicros: 10_000_000, currencyCode: 'GBP' },
    });
  });

  it('should link a manually entered gift to an existing recurring agreement', async () => {
    const suffix = `${Date.now()}-recurring`;
    const donorFirstName = `Nina${suffix}`;
    const donorLastName = 'Simone';
    const donorEmail = `nina.${suffix}@example.org`;

    const person = await createPerson({
      firstName: donorFirstName,
      lastName: donorLastName,
      email: donorEmail,
    });
    const recurringAgreement = await createRecurringAgreement({
      name: `Nina ${suffix} monthly giving`,
      personId: person.id,
    });

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '15.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
        donorChoice: 'USE_EXISTING',
        selectedDonorId: person.id,
        selectedRecurringAgreementId: recurringAgreement.id,
      },
    );

    const gift = await loadGiftById(response.giftId);

    expect(gift?.recurringAgreement?.id).toBe(recurringAgreement.id);
    expect(response.recurringAgreementId).toBe(recurringAgreement.id);
    expect(gift?.recurringAgreement?.nextExpectedAt).toBe('2026-05-21');
  });

  it('records a partial grant against the awarding company and refuses a different company', async () => {
    const suffix = `${Date.now()}-opportunity-gift`;
    const company = await createCompany({
      name: `Example Trust ${suffix}`,
    });
    const otherCompany = await createCompany({
      name: `Other Trust ${suffix}`,
    });
    const opportunity = await createOpportunity({
      name: `Example Trust grant ${suffix}`,
      companyId: company.id,
      fundingType: 'TRUST_FOUNDATION',
      awardedAmountMicros: 10_000_000,
    });
    const client = getCoreClient();
    const recordPayment = (selectedCompany: typeof company) =>
      callAppRoute<ManualGiftEntryResponse>(
        '/s/manual-gift-entry/create-gift',
        {
          donorType: 'COMPANY',
          companyName: selectedCompany.name,
          amountValue: '4.00',
          currencyCode: 'GBP',
          paymentType: 'BANK_TRANSFER',
          giftDate: '2026-04-25',
          giftType: 'GRANT',
          companyChoice: 'USE_EXISTING',
          selectedCompanyId: selectedCompany.id,
          selectedOpportunityId: opportunity.id,
        },
      );

    const { giftId } = await recordPayment(company);
    expect(await loadGiftById(giftId)).toMatchObject({
      company: { id: company.id },
      opportunity: { id: opportunity.id },
      giftType: 'GRANT',
      amount: { amountMicros: 4_000_000, currencyCode: 'GBP' },
    });

    await expect(recordPayment(otherCompany)).rejects.toThrow(
      'Selected opportunity does not belong to the selected company',
    );

    const result = await client.query({
      gifts: {
        __args: {
          first: 2,
          filter: {
            or: [
              { opportunityId: { eq: opportunity.id } },
              { companyId: { eq: otherCompany.id } },
            ],
          },
        },
        edges: { node: { id: true } },
      },
      opportunity: {
        __args: { filter: { id: { eq: opportunity.id } } },
        company: { id: true },
        awardedAmount: { amountMicros: true, currencyCode: true },
      },
    });
    expect(result.gifts?.edges.map(({ node }) => node.id)).toEqual([giftId]);
    expect(result.opportunity).toMatchObject({
      company: { id: company.id },
      awardedAmount: { amountMicros: 10_000_000, currencyCode: 'GBP' },
    });
  });

  it('should create a company gift without an opportunity', async () => {
    const suffix = `${Date.now()}-company-only`;
    const company = await createCompany({
      name: `Corporate donor ${suffix}`,
    });

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorType: 'COMPANY',
        companyName: company.name,
        amountValue: '250.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-25',
        giftType: 'DONATION',
        companyChoice: 'USE_EXISTING',
        selectedCompanyId: company.id,
      },
    );

    const gift = await loadGiftById(response.giftId);

    expect(gift?.company?.id).toBe(company.id);
    expect(gift?.opportunity ?? null).toBeNull();
    expect(gift?.giftType).toBe('DONATION');
  });
});
