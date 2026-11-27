import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import type { SaveGiftCodingResponse } from 'src/gift-record/gift-coding.types';
import type { ManualGiftEntryResponse } from 'src/manual-gift-entry/manual-gift-entry.types';
import {
  callAppRoute,
  createCompany,
  createPerson,
  getCoreClient,
} from './test-helpers';

it('rejects conflicting appeal coding and follows the new source for derived fundraiser credit', async () => {
  const client = getCoreClient();
  const label = `Coding fixture ${randomUUID()}`;
  const donor = await createPerson({ firstName: 'Donor', lastName: label });
  const fundraiser = await createPerson({ firstName: 'Fundraiser', lastName: label });
  const company = await createCompany({ name: `${label} company fundraiser` });
  const appealId = randomUUID();
  const otherAppealId = randomUUID();
  const fundId = randomUUID();
  const personSourceId = randomUUID();
  const companySourceId = randomUUID();

  await client.mutation({
    createFund: {
      __args: { data: { id: fundId, name: label } },
      id: true,
    },
    createAppeals: {
      __args: {
        data: [
          { id: appealId, name: `${label} original appeal` },
          { id: otherAppealId, name: `${label} corrected appeal` },
        ],
      },
      id: true,
    },
  });
  await client.mutation({
    createAppealSources: {
      __args: {
        data: [
          {
            id: personSourceId,
            name: `${label} person source`,
            appealId,
            fundraiserPersonId: fundraiser.id,
          },
          {
            id: companySourceId,
            name: `${label} company source`,
            appealId: otherAppealId,
            fundraiserCompanyId: company.id,
          },
        ],
      },
      id: true,
    },
  });

  const { giftId } = await callAppRoute<ManualGiftEntryResponse>(
    '/s/manual-gift-entry/create-gift',
    {
      donorFirstName: 'Donor',
      donorLastName: label,
      selectedDonorId: donor.id,
      donorChoice: 'USE_EXISTING',
      giftDate: '2026-04-21',
      amountValue: '25.00',
      currencyCode: 'GBP',
      paymentType: 'BANK_TRANSFER',
      selectedAppealSourceId: personSourceId,
      selectedFundId: fundId,
    },
  );
  const loadCoding = async () => {
    const { gift } = await client.query({
      gift: {
        __args: { filter: { id: { eq: giftId } } },
        donor: { id: true },
        giftDate: true,
        amount: { amountMicros: true, currencyCode: true },
        appeal: { id: true },
        appealSource: { id: true },
        fund: { id: true },
        softCreditType: true,
        softCreditPerson: { id: true },
        softCreditCompany: { id: true },
      },
    });
    return gift;
  };

  const giftFacts = {
    donor: { id: donor.id },
    amount: { amountMicros: 25_000_000, currencyCode: 'GBP' },
    giftDate: '2026-04-21',
    fund: { id: fundId },
    softCreditType: 'FUNDRAISER',
  };
  const original = await loadCoding();
  expect(original).toMatchObject({
    ...giftFacts,
    appeal: { id: appealId },
    appealSource: { id: personSourceId },
    softCreditPerson: { id: fundraiser.id },
    softCreditCompany: null,
  });

  const correctCoding = (selectedAppealId: string) =>
    callAppRoute<SaveGiftCodingResponse>('/s/gifts/save-coding', {
      giftId,
      appealId: selectedAppealId,
      appealSourceId: companySourceId,
      fundId,
    });
  await expect(correctCoding(appealId)).rejects.toThrow(
    'does not belong to the selected appeal',
  );
  expect(await loadCoding()).toEqual(original);

  await correctCoding(otherAppealId);
  expect(await loadCoding()).toMatchObject({
    ...giftFacts,
    appeal: { id: otherAppealId },
    appealSource: { id: companySourceId },
    softCreditPerson: null,
    softCreditCompany: { id: company.id },
  });
});
