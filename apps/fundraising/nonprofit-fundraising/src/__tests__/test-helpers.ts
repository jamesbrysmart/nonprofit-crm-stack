import { CoreApiClient } from 'twenty-client-sdk/core';

export const getCoreClient = () => new CoreApiClient();

export const getIntegrationApiConfig = () => {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'TWENTY_API_URL and TWENTY_API_KEY must be set for integration tests',
    );
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    apiKey,
  };
};

export const callAppRoute = async <TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> => {
  const { apiUrl, apiKey } = getIntegrationApiConfig();
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `Route call failed with status ${response.status}`);
  }

  return JSON.parse(rawBody) as TResponse;
};

export const createPerson = async ({
  firstName,
  lastName,
  email,
}: {
  firstName: string;
  lastName: string;
  email?: string;
}) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: {
            firstName,
            lastName,
          },
          ...(email
            ? {
                emails: {
                  primaryEmail: email,
                },
              }
            : {}),
        },
      },
      id: true,
      name: {
        firstName: true,
        lastName: true,
      },
      emails: {
        primaryEmail: true,
      },
      supporterEmailOptOut: true,
    },
  });

  return result.createPerson as {
    id: string;
    name?: { firstName?: string | null; lastName?: string | null } | null;
    emails?: { primaryEmail?: string | null } | null;
    supporterEmailOptOut?: boolean | null;
  };
};

export const loadPeopleByName = async (firstName: string, lastName: string) => {
  const client = getCoreClient();
  const result = await client.query({
    people: {
      __args: {
        first: 20,
        filter: {
          and: [
            {
              name: {
                firstName: {
                  eq: firstName,
                },
              },
            },
            {
              name: {
                lastName: {
                  eq: lastName,
                },
              },
            },
          ],
        },
      },
      edges: {
        node: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
          supporterEmailOptOut: true,
        },
      },
    },
  });

  return (
    result?.people?.edges?.map((edge: { node: unknown }) => edge.node) ?? []
  ) as Array<{
    id: string;
    name?: { firstName?: string | null; lastName?: string | null } | null;
    emails?: { primaryEmail?: string | null } | null;
    supporterEmailOptOut?: boolean | null;
  }>;
};

export const loadGiftById = async (giftId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    gift: {
      __args: {
        filter: {
          id: { eq: giftId },
        },
      },
      id: true,
      name: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      isAnonymousDonor: true,
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      giftDate: true,
      giftType: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftAidStatus: true,
      giftAidReasonCode: true,
      giftAidDecisionSource: true,
      giftAidLastEvaluatedAt: true,
      refundedAmount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftAidDeclaration: {
        id: true,
        source: true,
      },
      giftAidClaimBatch: {
        id: true,
        name: true,
        status: true,
      },
      recurringAgreement: {
        id: true,
        name: true,
        nextExpectedAt: true,
      },
      donor: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
        emails: {
          primaryEmail: true,
        },
        mailingAddress: {
          addressStreet1: true,
          addressStreet2: true,
          addressCity: true,
          addressState: true,
          addressPostcode: true,
          addressCountry: true,
        },
      },
      company: {
        id: true,
        name: true,
      },
      opportunity: {
        id: true,
        name: true,
        company: {
          id: true,
        },
      },
    },
  });

  return result?.gift ?? null;
};

export const createCompany = async ({ name }: { name: string }) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createCompany: {
      __args: {
        data: {
          name,
        },
      },
      id: true,
      name: true,
    },
  });

  return result.createCompany as {
    id: string;
    name: string;
  };
};

export const createOpportunity = async ({
  name,
  companyId,
  fundingType,
  amountMicros,
  amountCurrencyCode = 'GBP',
  awardedAmountMicros,
  awardedCurrencyCode = 'GBP',
}: {
  name: string;
  companyId: string;
  fundingType?:
    | 'GRANT'
    | 'TRUST_FOUNDATION'
    | 'STATUTORY_BID'
    | 'CORPORATE_SPONSORSHIP'
    | 'MAJOR_GIFT'
    | 'OTHER';
  amountMicros?: number;
  amountCurrencyCode?: string;
  awardedAmountMicros?: number;
  awardedCurrencyCode?: string;
}) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createOpportunity: {
      __args: {
        data: {
          name,
          ...(fundingType ? { fundingType } : {}),
          ...(typeof amountMicros === 'number'
            ? {
                amount: {
                  amountMicros,
                  currencyCode: amountCurrencyCode,
                },
              }
            : {}),
          ...(typeof awardedAmountMicros === 'number'
            ? {
                awardedAmount: {
                  amountMicros: awardedAmountMicros,
                  currencyCode: awardedCurrencyCode,
                },
              }
            : {}),
          company: {
            connect: {
              where: {
                id: companyId,
              },
            },
          },
        },
      },
      id: true,
      name: true,
      fundingType: true,
      company: {
        id: true,
      },
    },
  });

  return result.createOpportunity as {
    id: string;
    name: string;
    fundingType?: string | null;
    company?: { id?: string | null } | null;
  };
};

export const loadGiftStagingById = async (giftStagingId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    giftStaging: {
      __args: {
        filter: {
          id: { eq: giftStagingId },
        },
      },
      id: true,
      name: true,
      intakeSource: true,
      amount: {
        amountMicros: true,
        currencyCode: true,
      },
      giftDate: true,
      donationType: true,
      donorFirstName: true,
      donorLastName: true,
      donorEmail: true,
      donorPhone: true,
      isAnonymousDonor: true,
      supporterEmailOptOut: true,
      donorMailingAddress: {
        addressStreet1: true,
        addressStreet2: true,
        addressCity: true,
        addressState: true,
        addressPostcode: true,
        addressCountry: true,
      },
      externalId: true,
      sourceFingerprint: true,
      providerEventId: true,
      provider: true,
      providerPaymentId: true,
      paymentProviderCustomerId: true,
      providerAgreementId: true,
      providerIntervalUnit: true,
      providerIntervalCount: true,
      donationFormId: true,
      donationFormPublishedVersion: true,
      rawProviderEvidence: true,
      sourceAppealName: true,
      sourceFundName: true,
      donorResolutionState: true,
      giftReadyStatus: true,
      paymentState: true,
      processingStatus: true,
    },
  });

  return result?.giftStaging ?? null;
};

export const createRecurringAgreement = async ({
  name,
  personId,
  provider = 'MANUAL',
  providerAgreementId,
}: {
  name: string;
  personId: string;
  provider?: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerAgreementId?: string;
}) => {
  const client = getCoreClient();
  const result = await client.mutation({
    createRecurringAgreement: {
      __args: {
        data: {
          name,
          status: 'ACTIVE',
          cadence: 'MONTHLY',
          intervalCount: 1,
          amount: {
            currencyCode: 'GBP',
            amountMicros: 15_000_000,
          },
          startDate: '2026-01-01',
          nextExpectedAt: '2026-04-21',
          provider,
          ...(providerAgreementId ? { providerAgreementId } : {}),
          person: {
            connect: {
              where: {
                id: personId,
              },
            },
          },
        },
      },
      id: true,
      name: true,
      nextExpectedAt: true,
    },
  });

  return result.createRecurringAgreement as {
    id: string;
    name: string;
    nextExpectedAt?: string | null;
  };
};

export const loadRecurringAgreementById = async (recurringAgreementId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    recurringAgreement: {
      __args: {
        filter: {
          id: { eq: recurringAgreementId },
        },
      },
      id: true,
      name: true,
      provider: true,
      providerAgreementId: true,
      nextExpectedAt: true,
    },
  });

  return result?.recurringAgreement ?? null;
};

export const loadCurrentGiftAidClaimBatch = async () => {
  const client = getCoreClient();
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 10,
        filter: {
          status: {
            eq: 'DRAFT',
          },
        },
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          giftCount: true,
          blockingIssueCount: true,
          totalAmount: {
            amountMicros: true,
            currencyCode: true,
          },
        },
      },
    },
  });

  return result?.giftAidClaimBatches?.edges?.[0]?.node ?? null;
};

export const loadGiftAidDeclarationsForPerson = async (personId: string) => {
  const client = getCoreClient();
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 100,
        filter: {
          personId: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          id: true,
          status: true,
          source: true,
          declarationDate: true,
        },
      },
    },
  });

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: unknown }) => edge.node,
    ) ?? []
  ) as Array<{
    id: string;
    status?: string | null;
    source?: string | null;
    declarationDate?: string | null;
  }>;
};
