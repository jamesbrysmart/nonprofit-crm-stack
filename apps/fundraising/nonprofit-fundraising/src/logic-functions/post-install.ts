import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import type {
  AppealSourceSummary,
  AppealSummary,
  FundSummary,
  PersonSummary,
} from 'src/manual-gift-entry/manual-gift-entry.types';

type SeedPerson = {
  firstName: string;
  lastName: string;
  email: string;
  mailingAddress: {
    addressStreet1: string;
    addressCity: string;
    addressPostcode: string;
    addressCountry: string;
  };
};

type SeedBatch = {
  name: string;
  source: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'PROCESSED_WITH_ISSUES';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  expectedItemCount?: number | null;
  expectedTotalAmountMicros?: number | null;
};

type SeedFund = {
  name: string;
  code?: string;
  restrictionType:
    | 'UNRESTRICTED'
    | 'RESTRICTED'
    | 'DESIGNATED'
    | 'ENDOWMENT'
    | 'OTHER';
  isActive: boolean;
  description?: string;
  notes?: string;
};

type SeedAppeal = {
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  appealType:
    | 'GENERAL'
    | 'ANNUAL'
    | 'EMERGENCY'
    | 'REGULAR_GIVING'
    | 'EVENT_FUNDRAISING'
    | 'CAPITAL'
    | 'CROWDFUNDING'
    | 'OTHER';
  defaultFundName?: string;
  description?: string;
  externalReference?: string;
};

type SeedAppealSource = {
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  sourceType:
    | 'EMAIL'
    | 'DIRECT_MAIL'
    | 'DONATION_PAGE'
    | 'P2P_PAGE'
    | 'QR_CODE'
    | 'SOCIAL'
    | 'AD'
    | 'PARTNER'
    | 'PHONE'
    | 'EVENT_ASK'
    | 'SEGMENT'
    | 'OTHER';
  appealName: string;
  externalId?: string;
  sourceCode?: string;
  platform?: string;
  fundraiserPersonEmail?: string;
};

type SeedStagingRow = {
  name: string;
  intakeSource: string;
  amountMicros?: number | null;
  paymentType?:
    | 'CARD'
    | 'DIRECT_DEBIT'
    | 'BANK_TRANSFER'
    | 'CASH'
    | 'CHEQUE'
    | 'OTHER';
  donorFirstName: string;
  donorLastName: string;
  donorEmail?: string;
  giftDate: string | null;
  donorResolutionState: 'UNREVIEWED' | 'AMBIGUOUS' | 'NEW_DONOR' | 'CONFIRMED';
  giftReadyStatus?: 'NEEDS_REVIEW' | 'READY_TO_PROCESS' | null;
  processingStatus: 'NOT_PROCESSED' | 'PROCESS_FAILED';
  errorDetail: string | null;
  batchName: string;
  linkedDonorEmail?: string;
  provider?: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerPaymentId?: string;
  providerAgreementId?: string;
  providerIntervalUnit?: string;
  providerIntervalCount?: number;
  sourceAppealName?: string;
  sourceFundName?: string;
  appealSourceExternalId?: string;
  giftAidRequested?: boolean;
  giftAidDeclarationCaptured?: boolean;
  giftAidDeclarationDate?: string;
  giftAidCoverageScope?: string;
  giftAidDeclarationSource?: string;
  giftAidTextVersion?: string;
};

type BatchSummaryRecord = {
  id: string;
  name: string;
};

type ExistingFundRecord = FundSummary;
type ExistingAppealRecord = AppealSummary;
type ExistingAppealSourceRecord = AppealSourceSummary;

type ExistingGiftStagingRecord = {
  id: string;
  name: string;
};

type SeedRecurringAgreement = {
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'COMPLETED' | 'DELINQUENT';
  cadence: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';
  intervalCount: number;
  amountMicros: number;
  startDate: string;
  endDate?: string;
  nextExpectedAt?: string;
  provider: 'STRIPE' | 'GOCARDLESS' | 'MANUAL' | 'IMPORTED';
  providerAgreementId?: string;
  providerPaymentMethodId?: string;
  mandateReference?: string;
  donorEmail: string;
};

type ExistingRecurringAgreementRecord = {
  id: string;
  name: string;
};

type SeedGiftAidDeclaration = {
  name: string;
  donorEmail: string;
  status: 'ACTIVE' | 'INSUFFICIENT' | 'REVOKED' | 'SUPERSEDED';
  declarationDate?: string;
  coverageScope?: string;
  source?: string;
  textVersion?: string;
  statusReason?: string;
};

type ExistingGiftAidDeclarationRecord = {
  id: string;
  name: string;
};

type SeedGiftAidClaimBatch = {
  name: string;
  status: 'DRAFT' | 'FINALIZED';
  giftCount: number;
  totalAmountMicros: number;
  hasBlockingIssues: boolean;
  blockingIssueCount: number;
  submittedAt?: string;
  notes?: string;
};

type ExistingGiftAidClaimBatchRecord = {
  id: string;
  name: string;
};

type SeedGift = {
  name: string;
  donorEmail: string;
  amountMicros: number;
  giftDate: string;
  giftAidStatus: 'CLAIMABLE' | 'NOT_CLAIMABLE' | 'NEEDS_REVIEW';
  giftAidReasonCode: string;
  giftAidDecisionSource: 'SYSTEM' | 'MANUAL_OVERRIDE';
  giftAidLastEvaluatedAt: string;
  giftAidDeclarationName?: string;
  giftAidClaimBatchName?: string;
};

type ExistingGiftRecord = {
  id: string;
  name: string;
};

const SEED_PEOPLE: SeedPerson[] = [
  {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.org',
    mailingAddress: {
      addressStreet1: '12 Analytical Engine Row',
      addressCity: 'London',
      addressPostcode: 'SW1A 1AA',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Chris',
    lastName: 'Bennett',
    email: 'chris.bennett@example.org',
    mailingAddress: {
      addressStreet1: '44 Chapel Street',
      addressCity: 'Oxford',
      addressPostcode: 'OX1 2JD',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.one@example.org',
    mailingAddress: {
      addressStreet1: '3 River View',
      addressCity: 'Bristol',
      addressPostcode: 'BS1 5TR',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Jamie',
    lastName: 'Taylor',
    email: 'jamie.taylor.two@example.org',
    mailingAddress: {
      addressStreet1: '8 Kingsway',
      addressCity: 'Bristol',
      addressPostcode: 'BS6 2AB',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Elliot',
    lastName: 'Meyer',
    email: 'elliot.meyer@example.org',
    mailingAddress: {
      addressStreet1: '27 Market Lane',
      addressCity: 'Manchester',
      addressPostcode: 'M1 4HT',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Nora',
    lastName: 'Patel',
    email: 'nora.patel@example.org',
    mailingAddress: {
      addressStreet1: '19 Garden Close',
      addressCity: 'Leeds',
      addressPostcode: 'LS1 3AB',
      addressCountry: 'GB',
    },
  },
  {
    firstName: 'Robin',
    lastName: 'Sloan',
    email: 'robin.sloan@example.org',
    mailingAddress: {
      addressStreet1: '5 Harbour Street',
      addressCity: 'Liverpool',
      addressPostcode: 'L1 8JQ',
      addressCountry: 'GB',
    },
  },
];

const SEED_BATCHES: SeedBatch[] = [
  // Donor match fixture: exact match, ambiguous match, and no-candidate paths.
  {
    name: 'Donor match smoke batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 4,
    processedItems: 0,
    failedItems: 0,
  },
  {
    name: 'Check batch smoke batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 5,
    processedItems: 0,
    failedItems: 0,
    expectedItemCount: 5,
    expectedTotalAmountMicros: 53_000_000,
  },
  // Walkthrough fixture: a believable end-to-end CSV review flow.
  {
    name: 'CSV walkthrough batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 4,
    processedItems: 0,
    failedItems: 0,
    expectedItemCount: 4,
    expectedTotalAmountMicros: 46_500_000,
  },
  // Coding fixture: realistic imported coding clues for appeal/fund/source updates.
  {
    name: 'Coding smoke batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 5,
    processedItems: 0,
    failedItems: 0,
    expectedItemCount: 5,
    expectedTotalAmountMicros: 113_000_000,
  },
  // P2P fixture: imported fundraiser/page external ids, including one unresolved id.
  {
    name: 'P2P external ID import batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 4,
    processedItems: 0,
    failedItems: 0,
    expectedItemCount: 4,
    expectedTotalAmountMicros: 92_000_000,
  },
  // Workflow-limit fixture: enough rows to exercise oversized-batch behavior.
  {
    name: 'CSV pressure test batch',
    source: 'csv_import',
    status: 'PENDING',
    totalItems: 100,
    processedItems: 0,
    failedItems: 0,
    expectedItemCount: 100,
    expectedTotalAmountMicros: 1_281_000_000,
  },
];

const SEED_FUNDS: SeedFund[] = [
  {
    name: 'General Fund',
    code: 'GEN',
    restrictionType: 'UNRESTRICTED',
    isActive: true,
    description: 'General unrestricted support for the charity.',
    notes: 'Default unrestricted destination for broad support appeals.',
  },
  {
    name: 'Emergency Response Fund',
    code: 'ERF',
    restrictionType: 'RESTRICTED',
    isActive: true,
    description: 'Restricted support for time-sensitive frontline response work.',
    notes: 'Useful for testing appeal default-fund behavior on staging gifts.',
  },
];

const SEED_APPEALS: SeedAppeal[] = [
  {
    name: 'Spring Appeal 2026',
    status: 'ACTIVE',
    appealType: 'ANNUAL',
    defaultFundName: 'General Fund',
    description: 'General seasonal appeal for broad unrestricted support.',
    externalReference: 'SPRING-2026',
  },
  {
    name: 'Emergency Response Appeal',
    status: 'ACTIVE',
    appealType: 'EMERGENCY',
    defaultFundName: 'Emergency Response Fund',
    description: 'Appeal used for urgent public-facing emergency fundraising.',
    externalReference: 'EMERG-RESP',
  },
];

const SEED_APPEAL_SOURCES: SeedAppealSource[] = [
  {
    name: 'Spring email series',
    status: 'ACTIVE',
    sourceType: 'EMAIL',
    appealName: 'Spring Appeal 2026',
    externalId: 'SRC-SPRING-EMAIL-2026',
    sourceCode: 'SPR-EM-26',
    platform: 'Mailchimp',
    fundraiserPersonEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Emergency donation page',
    status: 'ACTIVE',
    sourceType: 'DONATION_PAGE',
    appealName: 'Emergency Response Appeal',
    externalId: 'SRC-EMERG-PAGE-2026',
    sourceCode: 'EMERG-WEB',
    platform: 'Website',
    fundraiserPersonEmail: 'nora.patel@example.org',
  },
  {
    name: 'Ada Lovelace fundraiser page',
    status: 'ACTIVE',
    sourceType: 'P2P_PAGE',
    appealName: 'Spring Appeal 2026',
    externalId: 'P2P-ADA-2026',
    sourceCode: 'P2P-ADA',
    platform: 'GiveMatch',
    fundraiserPersonEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Chris Bennett fundraiser page',
    status: 'ACTIVE',
    sourceType: 'P2P_PAGE',
    appealName: 'Spring Appeal 2026',
    externalId: 'P2P-CHRIS-2026',
    sourceCode: 'P2P-CHRIS',
    platform: 'GiveMatch',
    fundraiserPersonEmail: 'chris.bennett@example.org',
  },
];

// CSV import fixtures should stay clue-based by default.
// Use imported names and external ids here rather than prelinked appeal/fund/source
// relations so the staging workflow can demonstrate how it derives those links.
const SEED_STAGING_ROWS: SeedStagingRow[] = [
  // Donor match fixture: imported clues only, donor state resolved by match review.
  {
    name: 'Donor match smoke - Ada exact match',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-04-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Donor match smoke batch',
  },
  {
    name: 'Donor match smoke - Jamie exact match',
    intakeSource: 'csv_import',
    amountMicros: 12_500_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor.one@example.org',
    giftDate: '2026-04-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Donor match smoke batch',
  },
  {
    name: 'Donor match smoke - Jamie ambiguous by name',
    intakeSource: 'csv_import',
    amountMicros: 15_000_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor@unknown.example.org',
    giftDate: '2026-04-27',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Donor match smoke batch',
  },
  {
    name: 'Donor match smoke - Sasha no candidate',
    intakeSource: 'csv_import',
    amountMicros: 9_000_000,
    donorFirstName: 'Sasha',
    donorLastName: 'Baker',
    donorEmail: 'sasha.baker@example.org',
    giftDate: '2026-04-28',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Donor match smoke batch',
  },
  // Readiness fixture: separates ready rows from missing-data and donor-review blockers.
  {
    name: 'Check batch smoke - Ada ready',
    intakeSource: 'csv_import',
    amountMicros: 20_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-04-29',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Check batch smoke batch',
    linkedDonorEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Check batch smoke - Jamie missing amount',
    intakeSource: 'csv_import',
    amountMicros: null,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor.one@example.org',
    giftDate: '2026-04-30',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Check batch smoke batch',
    linkedDonorEmail: 'jamie.taylor.one@example.org',
  },
  {
    name: 'Check batch smoke - Elliot missing date',
    intakeSource: 'csv_import',
    amountMicros: 15_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: null,
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Check batch smoke batch',
    linkedDonorEmail: 'elliot.meyer@example.org',
  },
  {
    name: 'Check batch smoke - Jamie needs donor review',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor@unknown.example.org',
    giftDate: '2026-05-01',
    donorResolutionState: 'AMBIGUOUS',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Check batch smoke batch',
  },
  // This row intentionally starts with blank donor evidence, as a realistic CSV
  // import ambiguity. It should remain blocked unless a reviewer explicitly marks
  // it anonymous on the staging record.
  {
    name: 'Check batch smoke - blank donor evidence import',
    intakeSource: 'csv_import',
    amountMicros: 8_000_000,
    donorFirstName: '',
    donorLastName: '',
    donorEmail: '',
    giftDate: '2026-05-02',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Check batch smoke batch',
  },
  // Walkthrough fixture: believable CSV review path from match through readiness.
  {
    name: 'CSV walkthrough - Ada exact match valid',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-05-02',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV walkthrough batch',
  },
  {
    name: 'CSV walkthrough - Jamie ambiguous by name',
    intakeSource: 'csv_import',
    amountMicros: 12_500_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor@unknown.example.org',
    giftDate: '2026-05-03',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV walkthrough batch',
  },
  {
    name: 'CSV walkthrough - Elliot missing date',
    intakeSource: 'csv_import',
    amountMicros: 15_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV walkthrough batch',
  },
  {
    name: 'CSV walkthrough - Sasha no donor candidate',
    intakeSource: 'csv_import',
    amountMicros: 9_000_000,
    donorFirstName: 'Sasha',
    donorLastName: 'Baker',
    donorEmail: 'sasha.baker@example.org',
    giftDate: '2026-05-04',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV walkthrough batch',
  },
  // Coding fixtures: sparse imported rows that should still feel believable in a
  // CSV import, while giving us enough variation to review bulk appeal/fund/source
  // coding on the batch record.
  {
    name: 'Coding smoke - Ada uncoded donation',
    intakeSource: 'csv_import',
    amountMicros: 22_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-05-05',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Coding smoke batch',
    linkedDonorEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Coding smoke - imported appeal clue',
    intakeSource: 'csv_import',
    amountMicros: 18_500_000,
    donorFirstName: 'Chris',
    donorLastName: 'Bennett',
    donorEmail: 'chris.bennett@example.org',
    giftDate: '2026-05-05',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Coding smoke batch',
    linkedDonorEmail: 'chris.bennett@example.org',
    sourceAppealName: 'Spring Appeal 2026',
  },
  {
    name: 'Coding smoke - imported fund clue',
    intakeSource: 'csv_import',
    amountMicros: 14_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Coding smoke batch',
    linkedDonorEmail: 'elliot.meyer@example.org',
    sourceFundName: 'General Fund',
  },
  {
    name: 'Coding smoke - imported source external id',
    intakeSource: 'csv_import',
    amountMicros: 27_500_000,
    donorFirstName: 'Nora',
    donorLastName: 'Patel',
    donorEmail: 'nora.patel@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Coding smoke batch',
    linkedDonorEmail: 'nora.patel@example.org',
    appealSourceExternalId: 'SRC-SPRING-EMAIL-2026',
  },
  {
    name: 'Coding smoke - imported emergency clues',
    intakeSource: 'csv_import',
    amountMicros: 31_000_000,
    donorFirstName: 'Robin',
    donorLastName: 'Sloan',
    donorEmail: 'robin.sloan@example.org',
    giftDate: '2026-05-07',
    donorResolutionState: 'CONFIRMED',
    giftReadyStatus: 'READY_TO_PROCESS',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'Coding smoke batch',
    linkedDonorEmail: 'robin.sloan@example.org',
    sourceAppealName: 'Emergency Response Appeal',
    sourceFundName: 'Emergency Response Fund',
  },
  // P2P external-id fixture: multiple imported gifts can resolve to the same
  // fundraiser page, while one missing page stays visible for review.
  {
    name: 'P2P external ID - Ada page donation one',
    intakeSource: 'csv_import',
    amountMicros: 25_000_000,
    donorFirstName: 'Morgan',
    donorLastName: 'Reed',
    donorEmail: 'morgan.reed@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'NEW_DONOR',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'P2P external ID import batch',
    provider: 'IMPORTED',
    appealSourceExternalId: 'P2P-ADA-2026',
  },
  {
    name: 'P2P external ID - Ada page donation two',
    intakeSource: 'csv_import',
    amountMicros: 18_000_000,
    donorFirstName: 'Priya',
    donorLastName: 'Shah',
    donorEmail: 'priya.shah@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'NEW_DONOR',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'P2P external ID import batch',
    appealSourceExternalId: 'P2P-ADA-2026',
  },
  {
    name: 'P2P external ID - Chris page donation',
    intakeSource: 'csv_import',
    amountMicros: 21_000_000,
    donorFirstName: 'Theo',
    donorLastName: 'King',
    donorEmail: 'theo.king@example.org',
    giftDate: '2026-05-09',
    donorResolutionState: 'NEW_DONOR',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'PROCESS_FAILED',
    errorDetail:
      'Previous processing attempt failed before the retry check was run.',
    batchName: 'P2P external ID import batch',
    appealSourceExternalId: 'P2P-CHRIS-2026',
  },
  {
    name: 'P2P external ID - missing fundraiser page retry',
    intakeSource: 'csv_import',
    amountMicros: 28_000_000,
    donorFirstName: 'Lena',
    donorLastName: 'Ward',
    donorEmail: 'lena.ward@example.org',
    giftDate: '2026-05-09',
    donorResolutionState: 'NEW_DONOR',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'P2P external ID import batch',
    appealSourceExternalId: 'P2P-MISSING-2026',
  },
  {
    name: 'CSV pressure - Alina Mercer',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Alina',
    donorLastName: 'Mercer',
    donorEmail: 'alina.mercer@example.org',
    giftDate: '2026-05-05',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Ben Holloway',
    intakeSource: 'csv_import',
    amountMicros: 12_000_000,
    donorFirstName: 'Ben',
    donorLastName: 'Holloway',
    donorEmail: 'ben.holloway@example.org',
    giftDate: '2026-05-05',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Cara Fulton',
    intakeSource: 'csv_import',
    amountMicros: 15_000_000,
    donorFirstName: 'Cara',
    donorLastName: 'Fulton',
    donorEmail: 'cara.fulton@example.org',
    giftDate: '2026-05-05',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Devin Cross',
    intakeSource: 'csv_import',
    amountMicros: 18_000_000,
    donorFirstName: 'Devin',
    donorLastName: 'Cross',
    donorEmail: 'devin.cross@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Elena Brooks',
    intakeSource: 'csv_import',
    amountMicros: 22_000_000,
    donorFirstName: 'Elena',
    donorLastName: 'Brooks',
    donorEmail: 'elena.brooks@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Felix Moran',
    intakeSource: 'csv_import',
    amountMicros: 9_000_000,
    donorFirstName: 'Felix',
    donorLastName: 'Moran',
    donorEmail: 'felix.moran@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Greta Walsh',
    intakeSource: 'csv_import',
    amountMicros: 11_000_000,
    donorFirstName: 'Greta',
    donorLastName: 'Walsh',
    donorEmail: 'greta.walsh@example.org',
    giftDate: '2026-05-06',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Hugo Quinn',
    intakeSource: 'csv_import',
    amountMicros: 13_000_000,
    donorFirstName: 'Hugo',
    donorLastName: 'Quinn',
    donorEmail: 'hugo.quinn@example.org',
    giftDate: '2026-05-07',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Imani Clarke',
    intakeSource: 'csv_import',
    amountMicros: 14_000_000,
    donorFirstName: 'Imani',
    donorLastName: 'Clarke',
    donorEmail: 'imani.clarke@example.org',
    giftDate: '2026-05-07',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Jonah Pierce',
    intakeSource: 'csv_import',
    amountMicros: 16_000_000,
    donorFirstName: 'Jonah',
    donorLastName: 'Pierce',
    donorEmail: 'jonah.pierce@example.org',
    giftDate: '2026-05-07',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Keira Sutton',
    intakeSource: 'csv_import',
    amountMicros: 17_000_000,
    donorFirstName: 'Keira',
    donorLastName: 'Sutton',
    donorEmail: 'keira.sutton@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Luca Barrett',
    intakeSource: 'csv_import',
    amountMicros: 19_000_000,
    donorFirstName: 'Luca',
    donorLastName: 'Barrett',
    donorEmail: 'luca.barrett@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Mira Dawson',
    intakeSource: 'csv_import',
    amountMicros: 20_000_000,
    donorFirstName: 'Mira',
    donorLastName: 'Dawson',
    donorEmail: 'mira.dawson@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Noah Pritchard',
    intakeSource: 'csv_import',
    amountMicros: 21_000_000,
    donorFirstName: 'Noah',
    donorLastName: 'Pritchard',
    donorEmail: 'noah.pritchard@example.org',
    giftDate: '2026-05-08',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Orla Kemp',
    intakeSource: 'csv_import',
    amountMicros: 24_000_000,
    donorFirstName: 'Orla',
    donorLastName: 'Kemp',
    donorEmail: 'orla.kemp@example.org',
    giftDate: '2026-05-09',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Parker Lowe',
    intakeSource: 'csv_import',
    amountMicros: 8_000_000,
    donorFirstName: 'Parker',
    donorLastName: 'Lowe',
    donorEmail: 'parker.lowe@example.org',
    giftDate: '2026-05-09',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Quinn Delaney',
    intakeSource: 'csv_import',
    amountMicros: 26_000_000,
    donorFirstName: 'Quinn',
    donorLastName: 'Delaney',
    donorEmail: 'quinn.delaney@example.org',
    giftDate: '2026-05-09',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Rosa Everett',
    intakeSource: 'csv_import',
    amountMicros: 7_000_000,
    donorFirstName: 'Rosa',
    donorLastName: 'Everett',
    donorEmail: 'rosa.everett@example.org',
    giftDate: '2026-05-10',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Samir Holden',
    intakeSource: 'csv_import',
    amountMicros: 6_000_000,
    donorFirstName: 'Samir',
    donorLastName: 'Holden',
    donorEmail: 'samir.holden@example.org',
    giftDate: '2026-05-10',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Talia Byrne',
    intakeSource: 'csv_import',
    amountMicros: 23_000_000,
    donorFirstName: 'Talia',
    donorLastName: 'Byrne',
    donorEmail: 'talia.byrne@example.org',
    giftDate: '2026-05-10',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Uma Hart',
    intakeSource: 'csv_import',
    amountMicros: 9_500_000,
    donorFirstName: 'Uma',
    donorLastName: 'Hart',
    donorEmail: 'uma.hart@example.org',
    giftDate: '2026-05-10',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Victor Hale',
    intakeSource: 'csv_import',
    amountMicros: 10_500_000,
    donorFirstName: 'Victor',
    donorLastName: 'Hale',
    donorEmail: 'victor.hale@example.org',
    giftDate: '2026-05-11',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Wren Foster',
    intakeSource: 'csv_import',
    amountMicros: 13_500_000,
    donorFirstName: 'Wren',
    donorLastName: 'Foster',
    donorEmail: 'wren.foster@example.org',
    giftDate: '2026-05-11',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Xander Moss',
    intakeSource: 'csv_import',
    amountMicros: 14_500_000,
    donorFirstName: 'Xander',
    donorLastName: 'Moss',
    donorEmail: 'xander.moss@example.org',
    giftDate: '2026-05-11',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Yasmin Cole',
    intakeSource: 'csv_import',
    amountMicros: 16_500_000,
    donorFirstName: 'Yasmin',
    donorLastName: 'Cole',
    donorEmail: 'yasmin.cole@example.org',
    giftDate: '2026-05-12',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Zane Porter',
    intakeSource: 'csv_import',
    amountMicros: 17_500_000,
    donorFirstName: 'Zane',
    donorLastName: 'Porter',
    donorEmail: 'zane.porter@example.org',
    giftDate: '2026-05-12',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Amelie Grant',
    intakeSource: 'csv_import',
    amountMicros: 12_250_000,
    donorFirstName: 'Amelie',
    donorLastName: 'Grant',
    donorEmail: 'amelie.grant@example.org',
    giftDate: '2026-05-12',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Blair Nixon',
    intakeSource: 'csv_import',
    amountMicros: 11_750_000,
    donorFirstName: 'Blair',
    donorLastName: 'Nixon',
    donorEmail: 'blair.nixon@example.org',
    giftDate: '2026-05-12',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Cora Finch',
    intakeSource: 'csv_import',
    amountMicros: 18_750_000,
    donorFirstName: 'Cora',
    donorLastName: 'Finch',
    donorEmail: 'cora.finch@example.org',
    giftDate: '2026-05-13',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Dylan Abbott',
    intakeSource: 'csv_import',
    amountMicros: 10_250_000,
    donorFirstName: 'Dylan',
    donorLastName: 'Abbott',
    donorEmail: 'dylan.abbott@example.org',
    giftDate: '2026-05-13',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Elio Carr',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Elio',
    donorLastName: 'Carr',
    donorEmail: 'elio.carr@example.org',
    giftDate: '2026-05-14',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Farah Sloan',
    intakeSource: 'csv_import',
    amountMicros: 12_000_000,
    donorFirstName: 'Farah',
    donorLastName: 'Sloan',
    donorEmail: 'farah.sloan@example.org',
    giftDate: '2026-05-14',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Gideon Marsh',
    intakeSource: 'csv_import',
    amountMicros: 15_000_000,
    donorFirstName: 'Gideon',
    donorLastName: 'Marsh',
    donorEmail: 'gideon.marsh@example.org',
    giftDate: '2026-05-14',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Halle Voss',
    intakeSource: 'csv_import',
    amountMicros: 18_000_000,
    donorFirstName: 'Halle',
    donorLastName: 'Voss',
    donorEmail: 'halle.voss@example.org',
    giftDate: '2026-05-15',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Idris Monroe',
    intakeSource: 'csv_import',
    amountMicros: 22_000_000,
    donorFirstName: 'Idris',
    donorLastName: 'Monroe',
    donorEmail: 'idris.monroe@example.org',
    giftDate: '2026-05-15',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Jessa Wynn',
    intakeSource: 'csv_import',
    amountMicros: 9_000_000,
    donorFirstName: 'Jessa',
    donorLastName: 'Wynn',
    donorEmail: 'jessa.wynn@example.org',
    giftDate: '2026-05-15',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Kian Reeves',
    intakeSource: 'csv_import',
    amountMicros: 11_000_000,
    donorFirstName: 'Kian',
    donorLastName: 'Reeves',
    donorEmail: 'kian.reeves@example.org',
    giftDate: '2026-05-15',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Livia Stone',
    intakeSource: 'csv_import',
    amountMicros: 13_000_000,
    donorFirstName: 'Livia',
    donorLastName: 'Stone',
    donorEmail: 'livia.stone@example.org',
    giftDate: '2026-05-16',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Malik Sayer',
    intakeSource: 'csv_import',
    amountMicros: 14_000_000,
    donorFirstName: 'Malik',
    donorLastName: 'Sayer',
    donorEmail: 'malik.sayer@example.org',
    giftDate: '2026-05-16',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Nadia Rowe',
    intakeSource: 'csv_import',
    amountMicros: 16_000_000,
    donorFirstName: 'Nadia',
    donorLastName: 'Rowe',
    donorEmail: 'nadia.rowe@example.org',
    giftDate: '2026-05-16',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Omar Keating',
    intakeSource: 'csv_import',
    amountMicros: 17_000_000,
    donorFirstName: 'Omar',
    donorLastName: 'Keating',
    donorEmail: 'omar.keating@example.org',
    giftDate: '2026-05-17',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Paloma French',
    intakeSource: 'csv_import',
    amountMicros: 19_000_000,
    donorFirstName: 'Paloma',
    donorLastName: 'French',
    donorEmail: 'paloma.french@example.org',
    giftDate: '2026-05-17',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Quentin Hale',
    intakeSource: 'csv_import',
    amountMicros: 20_000_000,
    donorFirstName: 'Quentin',
    donorLastName: 'Hale',
    donorEmail: 'quentin.hale@example.org',
    giftDate: '2026-05-17',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Rhea Mercer',
    intakeSource: 'csv_import',
    amountMicros: 21_000_000,
    donorFirstName: 'Rhea',
    donorLastName: 'Mercer',
    donorEmail: 'rhea.mercer@example.org',
    giftDate: '2026-05-17',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Soren Vale',
    intakeSource: 'csv_import',
    amountMicros: 24_000_000,
    donorFirstName: 'Soren',
    donorLastName: 'Vale',
    donorEmail: 'soren.vale@example.org',
    giftDate: '2026-05-18',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Thalia Boone',
    intakeSource: 'csv_import',
    amountMicros: 8_000_000,
    donorFirstName: 'Thalia',
    donorLastName: 'Boone',
    donorEmail: 'thalia.boone@example.org',
    giftDate: '2026-05-18',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Ulric Nash',
    intakeSource: 'csv_import',
    amountMicros: 26_000_000,
    donorFirstName: 'Ulric',
    donorLastName: 'Nash',
    donorEmail: 'ulric.nash@example.org',
    giftDate: '2026-05-18',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Vera Moss',
    intakeSource: 'csv_import',
    amountMicros: 7_000_000,
    donorFirstName: 'Vera',
    donorLastName: 'Moss',
    donorEmail: 'vera.moss@example.org',
    giftDate: '2026-05-19',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Wes Lang',
    intakeSource: 'csv_import',
    amountMicros: 6_000_000,
    donorFirstName: 'Wes',
    donorLastName: 'Lang',
    donorEmail: 'wes.lang@example.org',
    giftDate: '2026-05-19',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Xiomara Dean',
    intakeSource: 'csv_import',
    amountMicros: 23_000_000,
    donorFirstName: 'Xiomara',
    donorLastName: 'Dean',
    donorEmail: 'xiomara.dean@example.org',
    giftDate: '2026-05-19',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Yvette Pike',
    intakeSource: 'csv_import',
    amountMicros: 9_500_000,
    donorFirstName: 'Yvette',
    donorLastName: 'Pike',
    donorEmail: 'yvette.pike@example.org',
    giftDate: '2026-05-19',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Zia Holloway',
    intakeSource: 'csv_import',
    amountMicros: 10_500_000,
    donorFirstName: 'Zia',
    donorLastName: 'Holloway',
    donorEmail: 'zia.holloway@example.org',
    giftDate: '2026-05-20',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Arlo Benton',
    intakeSource: 'csv_import',
    amountMicros: 13_500_000,
    donorFirstName: 'Arlo',
    donorLastName: 'Benton',
    donorEmail: 'arlo.benton@example.org',
    giftDate: '2026-05-20',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Briar Kemp',
    intakeSource: 'csv_import',
    amountMicros: 14_500_000,
    donorFirstName: 'Briar',
    donorLastName: 'Kemp',
    donorEmail: 'briar.kemp@example.org',
    giftDate: '2026-05-20',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Callum Frost',
    intakeSource: 'csv_import',
    amountMicros: 16_500_000,
    donorFirstName: 'Callum',
    donorLastName: 'Frost',
    donorEmail: 'callum.frost@example.org',
    giftDate: '2026-05-20',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Delia Rhys',
    intakeSource: 'csv_import',
    amountMicros: 17_500_000,
    donorFirstName: 'Delia',
    donorLastName: 'Rhys',
    donorEmail: 'delia.rhys@example.org',
    giftDate: '2026-05-21',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Emrys Cole',
    intakeSource: 'csv_import',
    amountMicros: 12_250_000,
    donorFirstName: 'Emrys',
    donorLastName: 'Cole',
    donorEmail: 'emrys.cole@example.org',
    giftDate: '2026-05-21',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Faye Mercer',
    intakeSource: 'csv_import',
    amountMicros: 11_750_000,
    donorFirstName: 'Faye',
    donorLastName: 'Mercer',
    donorEmail: 'faye.mercer@example.org',
    giftDate: '2026-05-21',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Gael Sutton',
    intakeSource: 'csv_import',
    amountMicros: 18_750_000,
    donorFirstName: 'Gael',
    donorLastName: 'Sutton',
    donorEmail: 'gael.sutton@example.org',
    giftDate: '2026-05-21',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Hester Bloom',
    intakeSource: 'csv_import',
    amountMicros: 10_250_000,
    donorFirstName: 'Hester',
    donorLastName: 'Bloom',
    donorEmail: 'hester.bloom@example.org',
    giftDate: '2026-05-22',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Ivo Mercer',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Ivo',
    donorLastName: 'Mercer',
    donorEmail: 'ivo.mercer@example.org',
    giftDate: '2026-05-22',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Juno Blake',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Juno',
    donorLastName: 'Blake',
    donorEmail: 'juno.blake@example.org',
    giftDate: '2026-05-22',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Kora Finch',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Kora',
    donorLastName: 'Finch',
    donorEmail: 'kora.finch@example.org',
    giftDate: '2026-05-22',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Leon Grove',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Leon',
    donorLastName: 'Grove',
    donorEmail: 'leon.grove@example.org',
    giftDate: '2026-05-22',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Mara Sutton',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Mara',
    donorLastName: 'Sutton',
    donorEmail: 'mara.sutton@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Niko Hale',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Niko',
    donorLastName: 'Hale',
    donorEmail: 'niko.hale@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Opal Warren',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Opal',
    donorLastName: 'Warren',
    donorEmail: 'opal.warren@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Penn Archer',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Penn',
    donorLastName: 'Archer',
    donorEmail: 'penn.archer@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Remi Shaw',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Remi',
    donorLastName: 'Shaw',
    donorEmail: 'remi.shaw@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Sia Benton',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Sia',
    donorLastName: 'Benton',
    donorEmail: 'sia.benton@example.org',
    giftDate: '2026-05-23',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Theo Vance',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Theo',
    donorLastName: 'Vance',
    donorEmail: 'theo.vance@example.org',
    giftDate: '2026-05-24',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Una Mercer',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Una',
    donorLastName: 'Mercer',
    donorEmail: 'una.mercer@example.org',
    giftDate: '2026-05-24',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Veda Quinn',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Veda',
    donorLastName: 'Quinn',
    donorEmail: 'veda.quinn@example.org',
    giftDate: '2026-05-24',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Willa Frost',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Willa',
    donorLastName: 'Frost',
    donorEmail: 'willa.frost@example.org',
    giftDate: '2026-05-24',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Xenia Moore',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Xenia',
    donorLastName: 'Moore',
    donorEmail: 'xenia.moore@example.org',
    giftDate: '2026-05-24',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Yara Brooks',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Yara',
    donorLastName: 'Brooks',
    donorEmail: 'yara.brooks@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Zuri Blake',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Zuri',
    donorLastName: 'Blake',
    donorEmail: 'zuri.blake@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Aiden Marsh',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Aiden',
    donorLastName: 'Marsh',
    donorEmail: 'aiden.marsh@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Bea Sloan',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Bea',
    donorLastName: 'Sloan',
    donorEmail: 'bea.sloan@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Cade Mercer',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Cade',
    donorLastName: 'Mercer',
    donorEmail: 'cade.mercer@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Dana Holloway',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Dana',
    donorLastName: 'Holloway',
    donorEmail: 'dana.holloway@example.org',
    giftDate: '2026-05-25',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Ada existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Chris existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Chris',
    donorLastName: 'Bennett',
    donorEmail: 'chris.bennett@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Elliot existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Nora existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Nora',
    donorLastName: 'Patel',
    donorEmail: 'nora.patel@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Robin existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Robin',
    donorLastName: 'Sloan',
    donorEmail: 'robin.sloan@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Jamie existing donor one',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor.one@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Jamie existing donor two',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Jamie',
    donorLastName: 'Taylor',
    donorEmail: 'jamie.taylor.two@example.org',
    giftDate: '2026-05-26',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Ada existing donor two',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Ada',
    donorLastName: 'Lovelace',
    donorEmail: 'ada.lovelace@example.org',
    giftDate: '2026-05-27',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Chris existing donor two',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Chris',
    donorLastName: 'Bennett',
    donorEmail: 'chris.bennett@example.org',
    giftDate: '2026-05-27',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Elliot existing donor two',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Elliot',
    donorLastName: 'Meyer',
    donorEmail: 'elliot.meyer@example.org',
    giftDate: '2026-05-27',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Maya blocked missing date',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Maya',
    donorLastName: 'Keene',
    donorEmail: 'maya.keene@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Niall blocked missing date',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Niall',
    donorLastName: 'Harper',
    donorEmail: 'niall.harper@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Oona blocked missing date',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Oona',
    donorLastName: 'Frost',
    donorEmail: 'oona.frost@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Percy blocked missing date',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Percy',
    donorLastName: 'Bloom',
    donorEmail: 'percy.bloom@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Rina blocked missing date',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Rina',
    donorLastName: 'Gale',
    donorEmail: 'rina.gale@example.org',
    giftDate: null,
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Soren Pike',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Soren',
    donorLastName: 'Pike',
    donorEmail: 'soren.pike@example.org',
    giftDate: '2026-05-28',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Tessa Cole',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Tessa',
    donorLastName: 'Cole',
    donorEmail: 'tessa.cole@example.org',
    giftDate: '2026-05-28',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Uriah Moss',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Uriah',
    donorLastName: 'Moss',
    donorEmail: 'uriah.moss@example.org',
    giftDate: '2026-05-28',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
  {
    name: 'CSV pressure - Viola Hart',
    intakeSource: 'csv_import',
    amountMicros: 10_000_000,
    donorFirstName: 'Viola',
    donorLastName: 'Hart',
    donorEmail: 'viola.hart@example.org',
    giftDate: '2026-05-28',
    donorResolutionState: 'UNREVIEWED',
    giftReadyStatus: 'NEEDS_REVIEW',
    processingStatus: 'NOT_PROCESSED',
    errorDetail: null,
    batchName: 'CSV pressure test batch',
  },
];

const SEED_RECURRING_AGREEMENTS: SeedRecurringAgreement[] = [
  {
    name: 'Ada Lovelace monthly giving',
    status: 'ACTIVE',
    cadence: 'MONTHLY',
    intervalCount: 1,
    amountMicros: 25_000_000,
    startDate: '2026-01-01',
    nextExpectedAt: '2026-05-01',
    provider: 'STRIPE',
    providerAgreementId: 'sub_ada_monthly',
    providerPaymentMethodId: 'pm_ada_visa',
    donorEmail: 'ada.lovelace@example.org',
  },
  {
    name: 'Chris Bennett standing order',
    status: 'DELINQUENT',
    cadence: 'MONTHLY',
    intervalCount: 1,
    amountMicros: 12_500_000,
    startDate: '2025-11-01',
    nextExpectedAt: '2026-04-05',
    provider: 'MANUAL',
    mandateReference: 'SO-CHRIS-001',
    donorEmail: 'chris.bennett@example.org',
  },
];

const SEED_GIFT_AID_DECLARATIONS: SeedGiftAidDeclaration[] = [
  {
    name: 'Ada Lovelace declaration 2026-01-15',
    donorEmail: 'ada.lovelace@example.org',
    status: 'ACTIVE',
    declarationDate: '2026-01-15',
    coverageScope: 'past_and_future',
    source: 'seed_data',
    textVersion: 'v1',
  },
  {
    name: 'Elliot Meyer insufficient declaration',
    donorEmail: 'elliot.meyer@example.org',
    status: 'INSUFFICIENT',
    declarationDate: '2026-02-10',
    coverageScope: 'future_only',
    source: 'seed_data',
    textVersion: 'v1',
    statusReason: 'donor_data_incomplete',
  },
];

const SEED_GIFT_AID_CLAIM_BATCHES: SeedGiftAidClaimBatch[] = [
  {
    name: 'Gift Aid walkthrough draft claim',
    status: 'DRAFT',
    giftCount: 1,
    totalAmountMicros: 25_000_000,
    hasBlockingIssues: true,
    blockingIssueCount: 1,
    notes:
      'Seeded exploratory draft claim for Gift Aid workspace and gift-record review.',
  },
  {
    name: 'Gift Aid walkthrough clean draft claim',
    status: 'DRAFT',
    giftCount: 1,
    totalAmountMicros: 31_000_000,
    hasBlockingIssues: false,
    blockingIssueCount: 0,
    notes:
      'Seeded clean Gift Aid draft claim for HMRC submission probe validation.',
  },
];

const SEED_GIFTS: SeedGift[] = [
  {
    name: 'Gift Aid walkthrough - Ada claimable',
    donorEmail: 'ada.lovelace@example.org',
    amountMicros: 25_000_000,
    giftDate: '2026-04-10',
    giftAidStatus: 'CLAIMABLE',
    giftAidReasonCode: 'valid_declaration_present',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-10T10:00:00.000Z',
    giftAidDeclarationName: 'Ada Lovelace declaration 2026-01-15',
    giftAidClaimBatchName: 'Gift Aid walkthrough draft claim',
  },
  {
    name: 'Gift Aid walkthrough - Elliot needs review in claim',
    donorEmail: 'elliot.meyer@example.org',
    amountMicros: 18_000_000,
    giftDate: '2026-04-11',
    giftAidStatus: 'NEEDS_REVIEW',
    giftAidReasonCode: 'donor_data_incomplete',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-11T11:15:00.000Z',
    giftAidDeclarationName: 'Elliot Meyer insufficient declaration',
    giftAidClaimBatchName: 'Gift Aid walkthrough draft claim',
  },
  {
    name: 'Gift Aid walkthrough - Chris needs review outside claim',
    donorEmail: 'chris.bennett@example.org',
    amountMicros: 12_500_000,
    giftDate: '2026-04-12',
    giftAidStatus: 'NEEDS_REVIEW',
    giftAidReasonCode: 'no_declaration_on_file',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-12T09:30:00.000Z',
  },
  {
    name: 'Gift Aid walkthrough - Nora not claimable',
    donorEmail: 'nora.patel@example.org',
    amountMicros: 9_000_000,
    giftDate: '2026-04-13',
    giftAidStatus: 'NOT_CLAIMABLE',
    giftAidReasonCode: 'not_requested',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-13T08:45:00.000Z',
  },
  {
    name: 'Gift Aid walkthrough - Ada claimable clean batch',
    donorEmail: 'ada.lovelace@example.org',
    amountMicros: 31_000_000,
    giftDate: '2026-04-14',
    giftAidStatus: 'CLAIMABLE',
    giftAidReasonCode: 'valid_declaration_present',
    giftAidDecisionSource: 'SYSTEM',
    giftAidLastEvaluatedAt: '2026-04-14T10:00:00.000Z',
    giftAidDeclarationName: 'Ada Lovelace declaration 2026-01-15',
    giftAidClaimBatchName: 'Gift Aid walkthrough clean draft claim',
  },
];

const normalizeEmail = (value: string | undefined | null) =>
  value?.trim().toLowerCase() ?? '';

const isUniqueViolationError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('uniqueness') ||
    lower.includes('already exists') ||
    lower.includes('violates unique')
  );
};

const loadPeople = async (client: CoreApiClient): Promise<PersonSummary[]> => {
  const result = await client.query({
    people: {
      __args: {
        first: 5000,
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
        },
      },
    },
  } as any);

  return (
    result?.people?.edges?.map(
      (edge: { node: PersonSummary }) => edge.node,
    ) ?? []
  );
};

const loadGiftBatches = async (
  client: CoreApiClient,
): Promise<BatchSummaryRecord[]> => {
  const result = await client.query({
    giftBatches: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftBatches?.edges?.map(
      (edge: { node: BatchSummaryRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftStagings = async (
  client: CoreApiClient,
): Promise<ExistingGiftStagingRecord[]> => {
  const result = await client.query({
    giftStagings: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftStagings?.edges?.map(
      (edge: { node: ExistingGiftStagingRecord }) => edge.node,
    ) ?? []
  );
};

const loadRecurringAgreements = async (
  client: CoreApiClient,
): Promise<ExistingRecurringAgreementRecord[]> => {
  const result = await client.query({
    recurringAgreements: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.recurringAgreements?.edges?.map(
      (edge: { node: ExistingRecurringAgreementRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftAidDeclarations = async (
  client: CoreApiClient,
): Promise<ExistingGiftAidDeclarationRecord[]> => {
  const result = await client.query({
    giftAidDeclarations: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidDeclarations?.edges?.map(
      (edge: { node: ExistingGiftAidDeclarationRecord }) => edge.node,
    ) ?? []
  );
};

const loadGiftAidClaimBatches = async (
  client: CoreApiClient,
): Promise<ExistingGiftAidClaimBatchRecord[]> => {
  const result = await client.query({
    giftAidClaimBatches: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.giftAidClaimBatches?.edges?.map(
      (edge: { node: ExistingGiftAidClaimBatchRecord }) => edge.node,
    ) ?? []
  );
};

const loadGifts = async (client: CoreApiClient): Promise<ExistingGiftRecord[]> => {
  const result = await client.query({
    gifts: {
      __args: {
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  } as any);

  return (
    result?.gifts?.edges?.map((edge: { node: ExistingGiftRecord }) => edge.node) ??
    []
  );
};

const loadFunds = async (client: CoreApiClient): Promise<ExistingFundRecord[]> => {
  const result = await client.query({
    funds: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      },
    },
  } as any);

  return (
    result?.funds?.edges?.map((edge: { node: ExistingFundRecord }) => edge.node) ??
    []
  );
};

const loadAppeals = async (
  client: CoreApiClient,
): Promise<ExistingAppealRecord[]> => {
  const result = await client.query({
    appeals: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          defaultFund: {
            id: true,
            name: true,
          },
        },
      },
    },
  } as any);

  return (
    result?.appeals?.edges?.map(
      (edge: { node: ExistingAppealRecord }) => edge.node,
    ) ?? []
  );
};

const loadAppealSources = async (
  client: CoreApiClient,
): Promise<ExistingAppealSourceRecord[]> => {
  const result = await client.query({
    appealSources: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          name: true,
          status: true,
          sourceType: true,
          fundraiserPerson: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
            emails: {
              primaryEmail: true,
            },
          },
          fundraiserCompany: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
            defaultFund: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  } as any);

  return (
    result?.appealSources?.edges?.map(
      (edge: { node: ExistingAppealSourceRecord }) => edge.node,
    ) ?? []
  );
};

const loadPersonByEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<PersonSummary | undefined> => {
  const result = await client.query({
    people: {
      __args: {
        first: 1,
        filter: {
          emails: {
            primaryEmail: {
              eq: email,
            },
          },
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
        },
      },
    },
  } as any);

  return result?.people?.edges?.[0]?.node as PersonSummary | undefined;
};

const findExistingPerson = (
  people: PersonSummary[],
  seed: SeedPerson,
): PersonSummary | undefined => {
  return people.find(
    (person) =>
      person.name?.firstName === seed.firstName &&
      person.name?.lastName === seed.lastName &&
      normalizeEmail(person.emails?.primaryEmail) === normalizeEmail(seed.email),
  );
};

const seedPeople = async (client: CoreApiClient) => {
  const existingPeople = await loadPeople(client);
  const peopleByEmail = new Map<string, PersonSummary>();

  for (const seed of SEED_PEOPLE) {
    const existing =
      findExistingPerson(existingPeople, seed) ??
      (await loadPersonByEmail(client, seed.email));

    if (existing) {
      await client.mutation({
        updatePerson: {
          __args: {
            id: existing.id,
            data: {
              mailingAddress: seed.mailingAddress,
            },
          },
          id: true,
        },
      } as any);
      peopleByEmail.set(seed.email, existing);
      continue;
    }

    try {
      const result = await client.mutation({
        createPerson: {
          __args: {
            data: {
              name: {
                firstName: seed.firstName,
                lastName: seed.lastName,
              },
              emails: {
                primaryEmail: seed.email,
              },
              mailingAddress: seed.mailingAddress,
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
        },
      } as any);

      const created = result?.createPerson as PersonSummary | undefined;

      if (created?.id) {
        peopleByEmail.set(seed.email, created);
      }
    } catch (error) {
      if (isUniqueViolationError(error)) {
        const duplicate =
          (await loadPersonByEmail(client, seed.email)) ??
          findExistingPerson(await loadPeople(client), seed);

        if (duplicate?.id) {
          peopleByEmail.set(seed.email, duplicate);
          continue;
        }
      }

      throw error;
    }
  }

  return peopleByEmail;
};

const seedBatches = async (client: CoreApiClient) => {
  const existingBatches = await loadGiftBatches(client);
  const batchesByName = new Map<string, BatchSummaryRecord>();

  for (const seed of SEED_BATCHES) {
    const existing = existingBatches.find((batch) => batch.name === seed.name);

    if (existing) {
      await client.mutation({
        updateGiftBatch: {
          __args: {
            id: existing.id,
            data: {
              source: seed.source,
              status: seed.status,
              totalItems: seed.totalItems,
              processedItems: seed.processedItems,
              failedItems: seed.failedItems,
              expectedItemCount: seed.expectedItemCount ?? null,
              expectedTotalAmount:
                typeof seed.expectedTotalAmountMicros === 'number'
                  ? {
                      currencyCode: 'GBP',
                      amountMicros: seed.expectedTotalAmountMicros,
                    }
                  : null,
            },
          },
          id: true,
          name: true,
        },
      } as any);
      batchesByName.set(seed.name, existing);
      continue;
    }

    const result = await client.mutation({
      createGiftBatch: {
        __args: {
          data: {
            name: seed.name,
            source: seed.source,
            status: seed.status,
            totalItems: seed.totalItems,
            processedItems: seed.processedItems,
            failedItems: seed.failedItems,
            expectedItemCount: seed.expectedItemCount ?? null,
            expectedTotalAmount:
              typeof seed.expectedTotalAmountMicros === 'number'
                ? {
                    currencyCode: 'GBP',
                    amountMicros: seed.expectedTotalAmountMicros,
                  }
                : null,
          },
        },
        id: true,
        name: true,
      },
    } as any);

    const created = result?.createGiftBatch as BatchSummaryRecord | undefined;

    if (created?.id) {
      batchesByName.set(seed.name, created);
    }
  }

  return batchesByName;
};

const seedFunds = async (client: CoreApiClient) => {
  const existingFunds = await loadFunds(client);
  const fundsByName = new Map<string, ExistingFundRecord>();

  for (const seed of SEED_FUNDS) {
    const existing = existingFunds.find((fund) => fund.name === seed.name);

    if (existing) {
      await client.mutation({
        updateFund: {
          __args: {
            id: existing.id,
            data: {
              code: seed.code ?? null,
              restrictionType: seed.restrictionType,
              isActive: seed.isActive,
              description: seed.description ?? null,
              notes: seed.notes ?? null,
            },
          },
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
      } as any);

      fundsByName.set(seed.name, {
        ...existing,
        code: seed.code ?? null,
        isActive: seed.isActive,
      });
      continue;
    }

    const result = await client.mutation({
      createFund: {
        __args: {
          data: {
            name: seed.name,
            code: seed.code ?? null,
            restrictionType: seed.restrictionType,
            isActive: seed.isActive,
            description: seed.description ?? null,
            notes: seed.notes ?? null,
          },
        },
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    } as any);

    const created = result?.createFund as ExistingFundRecord | undefined;

    if (created?.id) {
      fundsByName.set(seed.name, created);
    }
  }

  return fundsByName;
};

const seedAppeals = async (
  client: CoreApiClient,
  fundsByName: Map<string, ExistingFundRecord>,
) => {
  const existingAppeals = await loadAppeals(client);
  const appealsByName = new Map<string, ExistingAppealRecord>();

  for (const seed of SEED_APPEALS) {
    const existing = existingAppeals.find((appeal) => appeal.name === seed.name);
    const defaultFund = seed.defaultFundName
      ? fundsByName.get(seed.defaultFundName)
      : undefined;

    const data = {
      status: seed.status,
      appealType: seed.appealType,
      description: seed.description ?? null,
      externalReference: seed.externalReference ?? null,
      ...(defaultFund?.id
        ? {
            defaultFund: {
              connect: {
                where: {
                  id: defaultFund.id,
                },
              },
            },
          }
        : {
            defaultFund: {
              disconnect: true,
            },
          }),
    };

    if (existing) {
      await client.mutation({
        updateAppeal: {
          __args: {
            id: existing.id,
            data,
          },
          id: true,
          name: true,
          status: true,
          defaultFund: {
            id: true,
            name: true,
          },
        },
      } as any);

      appealsByName.set(seed.name, {
        ...existing,
        status: seed.status,
        defaultFund: defaultFund?.id
          ? {
              id: defaultFund.id,
              name: defaultFund.name,
            }
          : null,
      });
      continue;
    }

    const result = await client.mutation({
      createAppeal: {
        __args: {
          data: {
            name: seed.name,
            ...data,
          },
        },
        id: true,
        name: true,
        status: true,
        defaultFund: {
          id: true,
          name: true,
        },
      },
    } as any);

    const created = result?.createAppeal as ExistingAppealRecord | undefined;

    if (created?.id) {
      appealsByName.set(seed.name, created);
    }
  }

  return appealsByName;
};

const seedAppealSources = async (
  client: CoreApiClient,
  appealsByName: Map<string, ExistingAppealRecord>,
  peopleByEmail: Map<string, PersonSummary>,
) => {
  const existingAppealSources = await loadAppealSources(client);
  const appealSourcesByName = new Map<string, ExistingAppealSourceRecord>();

  for (const seed of SEED_APPEAL_SOURCES) {
    const existing = existingAppealSources.find(
      (appealSource) => appealSource.name === seed.name,
    );
    const appeal = appealsByName.get(seed.appealName);
    const fundraiserPerson = seed.fundraiserPersonEmail
      ? peopleByEmail.get(seed.fundraiserPersonEmail)
      : undefined;

    if (!appeal?.id) {
      throw new Error(`Seed appeal "${seed.appealName}" not found`);
    }

    const data = {
      status: seed.status,
      sourceType: seed.sourceType,
      externalId: seed.externalId ?? null,
      sourceCode: seed.sourceCode ?? null,
      platform: seed.platform ?? null,
      appeal: {
        connect: {
          where: {
            id: appeal.id,
          },
        },
      },
      ...(fundraiserPerson?.id
        ? {
            fundraiserPerson: {
              connect: {
                where: {
                  id: fundraiserPerson.id,
                },
              },
            },
          }
        : {
            fundraiserPerson: {
              disconnect: true,
            },
          }),
    };

    if (existing) {
      await client.mutation({
        updateAppealSource: {
          __args: {
            id: existing.id,
            data,
          },
          id: true,
          name: true,
          status: true,
          sourceType: true,
          fundraiserPerson: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
            emails: {
              primaryEmail: true,
            },
          },
          fundraiserCompany: {
            id: true,
            name: true,
          },
          appeal: {
            id: true,
            name: true,
            defaultFund: {
              id: true,
              name: true,
            },
          },
        },
      } as any);
      appealSourcesByName.set(seed.name, existing);
      continue;
    }

    const result = await client.mutation({
      createAppealSource: {
        __args: {
          data: {
            name: seed.name,
            ...data,
          },
        },
        id: true,
        name: true,
        status: true,
        sourceType: true,
        fundraiserPerson: {
          id: true,
          name: {
            firstName: true,
            lastName: true,
          },
          emails: {
            primaryEmail: true,
          },
        },
        fundraiserCompany: {
          id: true,
          name: true,
        },
        appeal: {
          id: true,
          name: true,
          defaultFund: {
            id: true,
            name: true,
          },
        },
      },
    } as any);

    const created = result?.createAppealSource as
      | ExistingAppealSourceRecord
      | undefined;

    if (created?.id) {
      appealSourcesByName.set(seed.name, created);
    }
  }

  return appealSourcesByName;
};

const seedGiftStagings = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
  batchesByName: Map<string, BatchSummaryRecord>,
) => {
  const existingRows = await loadGiftStagings(client);
  const existingRowNames = new Set(existingRows.map((row) => row.name));

  for (const seed of SEED_STAGING_ROWS) {
    if (existingRowNames.has(seed.name)) {
      continue;
    }

    const batch = batchesByName.get(seed.batchName);

    if (!batch) {
      throw new Error(`Seed batch "${seed.batchName}" not found`);
    }

    const linkedDonor = seed.linkedDonorEmail
      ? peopleByEmail.get(seed.linkedDonorEmail)
      : undefined;

    await client.mutation({
      createGiftStaging: {
        __args: {
          data: {
            name: seed.name,
            intakeSource: seed.intakeSource,
            amount:
              typeof seed.amountMicros === 'number'
                ? {
                    currencyCode: 'GBP',
                    amountMicros: seed.amountMicros,
                  }
                : {
                    currencyCode: 'GBP',
                    amountMicros: null,
                  },
            giftDate: seed.giftDate,
            paymentType:
              seed.paymentType ??
              (seed.provider === 'STRIPE' ? 'CARD' : 'BANK_TRANSFER'),
            donorFirstName: seed.donorFirstName,
            donorLastName: seed.donorLastName,
            ...(seed.donorEmail
              ? {
                  donorEmail: seed.donorEmail,
                }
              : {}),
            ...(seed.provider ? { provider: seed.provider } : {}),
            ...(seed.providerPaymentId
              ? { providerPaymentId: seed.providerPaymentId }
              : {}),
            ...(seed.providerAgreementId
              ? { providerAgreementId: seed.providerAgreementId }
              : {}),
            ...(seed.providerIntervalUnit
              ? { providerIntervalUnit: seed.providerIntervalUnit }
              : {}),
            ...(typeof seed.providerIntervalCount === 'number'
              ? { providerIntervalCount: seed.providerIntervalCount }
              : {}),
            ...(seed.sourceAppealName
              ? { sourceAppealName: seed.sourceAppealName }
              : {}),
            ...(seed.sourceFundName
              ? { sourceFundName: seed.sourceFundName }
              : {}),
            ...(seed.appealSourceExternalId
              ? { appealSourceExternalId: seed.appealSourceExternalId }
              : {}),
            donorResolutionState: seed.donorResolutionState,
            giftReadyStatus: seed.giftReadyStatus ?? 'NEEDS_REVIEW',
            processingStatus: seed.processingStatus,
            errorDetail: seed.errorDetail,
            giftAidRequested: seed.giftAidRequested ?? false,
            giftAidDeclarationCaptured:
              seed.giftAidDeclarationCaptured ?? false,
            ...(seed.giftAidDeclarationDate
              ? { giftAidDeclarationDate: seed.giftAidDeclarationDate }
              : {}),
            ...(seed.giftAidCoverageScope
              ? { giftAidCoverageScope: seed.giftAidCoverageScope }
              : {}),
            ...(seed.giftAidDeclarationSource
              ? { giftAidDeclarationSource: seed.giftAidDeclarationSource }
              : {}),
            ...(seed.giftAidTextVersion
              ? { giftAidTextVersion: seed.giftAidTextVersion }
              : {}),
            giftBatch: {
              connect: {
                where: {
                  id: batch.id,
                },
              },
            },
            ...(linkedDonor
              ? {
                  donor: {
                    connect: {
                      where: {
                        id: linkedDonor.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedGiftAidDeclarations = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
) => {
  const existingDeclarations = await loadGiftAidDeclarations(client);

  for (const seed of SEED_GIFT_AID_DECLARATIONS) {
    const existing = existingDeclarations.find(
      (declaration) => declaration.name === seed.name,
    );

    if (existing) {
      continue;
    }

    const person = peopleByEmail.get(seed.donorEmail);

    if (!person?.id) {
      throw new Error(`Seed donor "${seed.donorEmail}" not found`);
    }

    await client.mutation({
      createGiftAidDeclaration: {
        __args: {
          data: {
            name: seed.name,
            personId: person.id,
            status: seed.status,
            ...(seed.declarationDate
              ? { declarationDate: seed.declarationDate }
              : {}),
            ...(seed.coverageScope ? { coverageScope: seed.coverageScope } : {}),
            ...(seed.source ? { source: seed.source } : {}),
            ...(seed.textVersion ? { textVersion: seed.textVersion } : {}),
            ...(seed.statusReason ? { statusReason: seed.statusReason } : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedGiftAidClaimBatches = async (client: CoreApiClient) => {
  const existingBatches = await loadGiftAidClaimBatches(client);
  const batchesByName = new Map<string, ExistingGiftAidClaimBatchRecord>();

  for (const seed of SEED_GIFT_AID_CLAIM_BATCHES) {
    const existing = existingBatches.find((batch) => batch.name === seed.name);

    if (existing) {
      batchesByName.set(seed.name, existing);
      continue;
    }

    const result = await client.mutation({
      createGiftAidClaimBatch: {
        __args: {
          data: {
            name: seed.name,
            status: seed.status,
            giftCount: seed.giftCount,
            totalAmount: {
              currencyCode: 'GBP',
              amountMicros: seed.totalAmountMicros,
            },
            hasBlockingIssues: seed.hasBlockingIssues,
            blockingIssueCount: seed.blockingIssueCount,
            ...(seed.submittedAt ? { submittedAt: seed.submittedAt } : {}),
            ...(seed.notes ? { notes: seed.notes } : {}),
          },
        },
        id: true,
        name: true,
      },
    } as any);

    const created = result?.createGiftAidClaimBatch as
      | ExistingGiftAidClaimBatchRecord
      | undefined;

    if (created?.id) {
      batchesByName.set(seed.name, created);
    }
  }

  return batchesByName;
};

const seedGifts = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
  declarationsByName: Map<string, ExistingGiftAidDeclarationRecord>,
  claimBatchesByName: Map<string, ExistingGiftAidClaimBatchRecord>,
) => {
  const existingGifts = await loadGifts(client);
  const existingGiftNames = new Set(existingGifts.map((gift) => gift.name));

  for (const seed of SEED_GIFTS) {
    if (existingGiftNames.has(seed.name)) {
      continue;
    }

    const donor = peopleByEmail.get(seed.donorEmail);
    if (!donor?.id) {
      throw new Error(`Seed donor "${seed.donorEmail}" not found for gift "${seed.name}"`);
    }

    const declaration = seed.giftAidDeclarationName
      ? declarationsByName.get(seed.giftAidDeclarationName)
      : undefined;
    const claimBatch = seed.giftAidClaimBatchName
      ? claimBatchesByName.get(seed.giftAidClaimBatchName)
      : undefined;

    await client.mutation({
      createGift: {
        __args: {
          data: {
            name: seed.name,
            amount: {
              currencyCode: 'GBP',
              amountMicros: seed.amountMicros,
            },
            giftDate: seed.giftDate,
            donorFirstName: donor.name?.firstName ?? '',
            donorLastName: donor.name?.lastName ?? '',
            ...(donor.emails?.primaryEmail
              ? { donorEmail: donor.emails.primaryEmail }
              : {}),
            donor: {
              connect: {
                where: {
                  id: donor.id,
                },
              },
            },
            giftAidStatus: seed.giftAidStatus,
            giftAidReasonCode: seed.giftAidReasonCode,
            giftAidDecisionSource: seed.giftAidDecisionSource,
            giftAidLastEvaluatedAt: seed.giftAidLastEvaluatedAt,
            ...(declaration?.id
              ? {
                  giftAidDeclaration: {
                    connect: {
                      where: {
                        id: declaration.id,
                      },
                    },
                  },
                }
              : {}),
            ...(claimBatch?.id
              ? {
                  giftAidClaimBatch: {
                    connect: {
                      where: {
                        id: claimBatch.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const seedRecurringAgreements = async (
  client: CoreApiClient,
  peopleByEmail: Map<string, PersonSummary>,
) => {
  const existingAgreements = await loadRecurringAgreements(client);

  for (const seed of SEED_RECURRING_AGREEMENTS) {
    const existing = existingAgreements.find(
      (agreement) => agreement.name === seed.name,
    );

    if (existing) {
      continue;
    }

    const person = peopleByEmail.get(seed.donorEmail);

    await client.mutation({
      createRecurringAgreement: {
        __args: {
          data: {
            name: seed.name,
            status: seed.status,
            cadence: seed.cadence,
            intervalCount: seed.intervalCount,
            amount: {
              currencyCode: 'GBP',
              amountMicros: seed.amountMicros,
            },
            startDate: seed.startDate,
            ...(seed.endDate ? { endDate: seed.endDate } : {}),
            ...(seed.nextExpectedAt
              ? { nextExpectedAt: seed.nextExpectedAt }
              : {}),
            provider: seed.provider,
            ...(seed.providerAgreementId
              ? { providerAgreementId: seed.providerAgreementId }
              : {}),
            ...(seed.providerPaymentMethodId
              ? { providerPaymentMethodId: seed.providerPaymentMethodId }
              : {}),
            ...(seed.mandateReference
              ? { mandateReference: seed.mandateReference }
              : {}),
            ...(person?.id
              ? {
                  person: {
                    connect: {
                      where: {
                        id: person.id,
                      },
                    },
                  },
                }
              : {}),
          },
        },
        id: true,
      },
    } as any);
  }
};

const handler = async (): Promise<void> => {
  const client = new CoreApiClient();

  // This seed set is intentionally idempotent because it is a development
  // harness we expect to rerun as slices are added and refined.
  const peopleByEmail = await seedPeople(client);
  const batchesByName = await seedBatches(client);
  const fundsByName = await seedFunds(client);
  const appealsByName = await seedAppeals(client, fundsByName);
  await seedAppealSources(client, appealsByName, peopleByEmail);
  await seedGiftAidDeclarations(client, peopleByEmail);
  const declarationRecords = await loadGiftAidDeclarations(client);
  const declarationsByName = new Map(
    declarationRecords.map((declaration) => [declaration.name, declaration] as const),
  );
  const claimBatchesByName = await seedGiftAidClaimBatches(client);
  await seedRecurringAgreements(client, peopleByEmail);
  await seedGifts(
    client,
    peopleByEmail,
    declarationsByName,
    claimBatchesByName,
  );

  await seedGiftStagings(client, peopleByEmail, batchesByName);
};

export default definePostInstallLogicFunction({
  universalIdentifier: 'd73bfd2a-68db-44ab-a1c5-2b6bfa07735a',
  name: 'post-install',
  description:
    'Seeds local development data for manual entry and staging-review slices.',
  timeoutSeconds: 120,
  handler,
});
