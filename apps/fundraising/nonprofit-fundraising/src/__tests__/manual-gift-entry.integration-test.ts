import { describe, expect, it } from 'vitest';
import type {
  DuplicateCheckResponse,
  ManualGiftEntryResponse,
} from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  callAppRoute,
  createRecurringAgreement,
  createPerson,
  loadCurrentGiftAidClaimBatch,
  loadGiftById,
  loadGiftAidDeclarationsForPerson,
  loadPeopleByName,
} from './test-helpers';

describe('Manual gift entry routes', () => {
  it('should return expected duplicate-check categories', async () => {
    const suffix = Date.now().toString();
    const uniqueAdaFirstName = `Ada${suffix}`;
    const uniqueJamieFirstName = `Jamie${suffix}`;
    const uniqueMissingFirstName = `Morgan${suffix}`;

    await createPerson({
      firstName: uniqueAdaFirstName,
      lastName: 'Lovelace',
      email: `ada.${suffix}@example.org`,
    });

    await createPerson({
      firstName: uniqueJamieFirstName,
      lastName: 'Taylor',
      email: `jamie.one.${suffix}@example.org`,
    });
    await createPerson({
      firstName: uniqueJamieFirstName,
      lastName: 'Taylor',
      email: `jamie.two.${suffix}@example.org`,
    });

    const adaResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: uniqueAdaFirstName,
        donorLastName: 'Lovelace',
      },
    );
    expect(adaResult.status).toBe('SINGLE_EXACT_MATCH');
    expect(adaResult.candidates).toHaveLength(1);

    const jamieResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: uniqueJamieFirstName,
        donorLastName: 'Taylor',
      },
    );
    expect(jamieResult.status).toBe('MULTIPLE_EXACT_MATCHES');
    expect(jamieResult.candidates.length).toBeGreaterThan(1);

    const missingResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName: uniqueMissingFirstName,
        donorLastName: 'Pryce',
      },
    );
    expect(missingResult.status).toBe('NO_MATCH');
    expect(missingResult.candidates).toHaveLength(0);
  });

  it('should create a gift linked to an existing donor after explicit donor choice', async () => {
    const suffix = `${Date.now()}-existing`;
    const donorFirstName = `Ada${suffix}`;
    const donorLastName = 'Lovelace';
    const donorEmail = `ada.${suffix}@example.org`;

    await createPerson({
      firstName: donorFirstName,
      lastName: donorLastName,
      email: donorEmail,
    });

    const duplicateResult = await callAppRoute<DuplicateCheckResponse>(
      '/s/donor-resolution/check-donor-duplicates',
      {
        donorFirstName,
        donorLastName,
      },
    );

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '25.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-21',
        donorChoice: 'USE_EXISTING',
        selectedDonorId: duplicateResult.candidates[0]?.id,
      },
    );

    expect(response.giftId).toBeDefined();
    expect(response.donorChoice).toBe('USE_EXISTING');

    const gift = await loadGiftById(response.giftId);
    expect(gift).toBeTruthy();
    expect(gift?.donor?.id).toBe(duplicateResult.candidates[0]?.id);
    expect(gift?.donorFirstName).toBe(donorFirstName);
    expect(gift?.donorLastName).toBe(donorLastName);
    expect(gift?.donorEmail).toBe(donorEmail);
  });

  it('should create a new donor and linked gift when no duplicate exists', async () => {
    const suffix = `${Date.now()}-new`;
    const donorFirstName = `Morgan${suffix}`;
    const donorLastName = 'Pryce';
    const donorEmail = `morgan.${suffix}@example.org`;

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '18.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
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
    expect(gift?.donor?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    expect(people).toHaveLength(1);
    expect(people[0]?.emails?.primaryEmail).toBe(donorEmail);
    expect(gift?.donor?.id).toBe(people[0]?.id);
  });

  it('should derive Gift Aid outcome and create a declaration when capture facts are provided', async () => {
    const suffix = `${Date.now()}-gift-aid`;
    const donorFirstName = `Grace${suffix}`;
    const donorLastName = 'Hopper';
    const donorEmail = `grace.${suffix}@example.org`;

    const response = await callAppRoute<ManualGiftEntryResponse>(
      '/s/manual-gift-entry/create-gift',
      {
        donorFirstName,
        donorLastName,
        donorEmail,
        amountValue: '33.00',
        currencyCode: 'GBP',
        paymentType: 'BANK_TRANSFER',
        giftDate: '2026-04-22',
        giftAidRequested: true,
        giftAidDeclarationCaptured: true,
        giftAidDeclarationDate: '2026-04-22',
        giftAidCoverageScope: 'past_and_future',
        giftAidDeclarationSource: 'manual_entry',
        giftAidTextVersion: 'v1',
        donorChoice: 'CREATE_NEW',
      },
    );

    const gift = await loadGiftById(response.giftId);
    expect(gift?.giftAidStatus).toBe('CLAIMABLE');
    expect(gift?.giftAidReasonCode).toBe('valid_declaration_present');
    expect(gift?.giftAidDeclaration?.id).toBeTruthy();
    expect(gift?.giftAidClaimBatch?.id).toBeTruthy();

    const people = await loadPeopleByName(donorFirstName, donorLastName);
    const declarations = await loadGiftAidDeclarationsForPerson(people[0]!.id);
    const currentDraft = await loadCurrentGiftAidClaimBatch();

    expect(declarations).toHaveLength(1);
    expect(declarations[0]?.status).toBe('ACTIVE');
    expect(declarations[0]?.source).toBe('manual_entry');
    expect(currentDraft?.id).toBe(gift?.giftAidClaimBatch?.id);
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
});
