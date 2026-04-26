import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (a: { universalIdentifier: string }) =>
        a.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('Fundraising metadata', () => {
  it('should install the key fundraising objects and fields for the spike', async () => {
    const client = new MetadataApiClient();

    const { objects } = await client.query({
      objects: {
        __args: {
          filter: { isCustom: { is: true } },
          paging: { first: 100 },
        },
        edges: {
          node: {
            nameSingular: true,
            fields: {
              __args: {
                paging: { first: 200 },
              },
              edges: {
                node: {
                  name: true,
                },
              },
            },
          },
        },
      },
    });

    const customObjects = objects.edges.map(
      (edge: {
        node: {
          nameSingular: string;
          fields: {
            edges: Array<{ node: { name: string } }>;
          };
        };
      }) => edge.node,
    );

    const gift = customObjects.find((object) => object.nameSingular === 'gift');
    const giftBatch = customObjects.find(
      (object) => object.nameSingular === 'giftBatch',
    );
    const giftAidDeclaration = customObjects.find(
      (object) => object.nameSingular === 'giftAidDeclaration',
    );
    const giftAidClaimBatch = customObjects.find(
      (object) => object.nameSingular === 'giftAidClaimBatch',
    );
    const giftAidClaimSubmission = customObjects.find(
      (object) => object.nameSingular === 'giftAidClaimSubmission',
    );
    const stagingReviewItem = customObjects.find(
      (object) => object.nameSingular === 'stagingReviewItem',
    );

    expect(gift).toBeDefined();
    expect(giftBatch).toBeDefined();
    expect(giftAidDeclaration).toBeDefined();
    expect(giftAidClaimBatch).toBeDefined();
    expect(giftAidClaimSubmission).toBeDefined();
    expect(stagingReviewItem).toBeDefined();

    const giftFieldNames =
      gift?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(giftFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'amount',
        'giftDate',
        'donorFirstName',
        'donorLastName',
        'donorEmail',
        'giftAidStatus',
        'giftAidReasonCode',
        'giftAidDecisionSource',
        'giftAidLastEvaluatedAt',
        'giftAidClaimBatch',
        'giftAidDeclaration',
        'donor',
        'sourceStagingItems',
      ]),
    );

    const declarationFieldNames =
      giftAidDeclaration?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(declarationFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'status',
        'statusReason',
        'declarationDate',
        'coverageScope',
        'source',
        'textVersion',
        'revokedAt',
        'notes',
        'person',
        'gifts',
        'stagingReviewItems',
      ]),
    );

    const claimBatchFieldNames =
      giftAidClaimBatch?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(claimBatchFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'status',
        'submittedAt',
        'giftCount',
        'totalAmount',
        'hasBlockingIssues',
        'blockingIssueCount',
        'gifts',
        'giftAidClaimSubmissions',
      ]),
    );

    const claimSubmissionFieldNames =
      giftAidClaimSubmission?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(claimSubmissionFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'status',
        'environment',
        'submittedAt',
        'completedAt',
        'externalSubmissionId',
        'correlationId',
        'failureCode',
        'failureMessage',
        'snapshotJson',
        'responseJson',
        'giftAidClaimBatch',
      ]),
    );

    const batchFieldNames =
      giftBatch?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(batchFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'status',
        'totalItems',
        'processedItems',
        'failedItems',
        'stagingReviewItems',
      ]),
    );

    const stagingFieldNames =
      stagingReviewItem?.fields.edges.map((edge) => edge.node.name) ?? [];
    expect(stagingFieldNames).toEqual(
      expect.arrayContaining([
        'name',
        'donorFirstName',
        'donorLastName',
        'donorEmail',
        'donor',
        'giftBatch',
        'committedGift',
        'giftAidRequested',
        'giftAidDeclarationCaptured',
        'giftAidDeclarationDate',
        'giftAidCoverageScope',
        'giftAidDeclarationSource',
        'giftAidTextVersion',
        'giftAidDeclaration',
        'processingStatus',
        'errorDetail',
        'processingOutcome',
        'isReadyForProcessing',
      ]),
    );
  });
});
