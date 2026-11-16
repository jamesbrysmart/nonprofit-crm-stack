import { v5 as uuidv5 } from 'uuid';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type StripeEventRecordResult = { created: boolean; id: string };

export const createStripeEventRecord = async ({
  eventId,
  recordType,
  findExisting,
  createRecord,
}: {
  eventId: string;
  recordType: 'gift' | 'giftStaging';
  findExisting: () => Promise<string | null>;
  createRecord: (id: string) => Promise<string>;
}): Promise<StripeEventRecordResult> => {
  const existingId = await findExisting();
  if (existingId) return { created: false, id: existingId };

  // This name/namespace is durable: changing it would defeat replay protection.
  // Insert-only primary-key uniqueness arbitrates between independent deliveries.
  const id = uuidv5(`stripe-event:${recordType}:${eventId}`, APPLICATION_UNIVERSAL_IDENTIFIER);
  let createdId: string;
  try {
    createdId = await createRecord(id);
  } catch (error) {
    // A competing insert or lost response can both mean the record already committed.
    // Confirm that fact rather than interpreting error strings or attempting another write.
    const committedId = await findExisting();
    if (!committedId) throw error;
    return { created: false, id: committedId };
  }

  if (createdId !== id) {
    throw new Error('Stripe event record creation returned an unexpected identifier');
  }
  return { created: true, id };
};
