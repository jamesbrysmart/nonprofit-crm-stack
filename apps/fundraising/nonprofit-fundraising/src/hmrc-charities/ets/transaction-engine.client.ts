export interface GovTalkTransactionEngineEndpoints {
  submissionUrl: string;
  pollUrl: string;
}

export interface GovTalkSubmissionAcknowledgement {
  qualifier?: string;
  correlationId?: string;
  transactionId?: string;
  responseEndpoint?: string;
  gatewayTimestamp?: string;
  errorNumber?: string;
  errorText?: string;
  rawXml: string;
}

const extractTagValue = (xml: string, tagName: string): string | undefined => {
  const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`);
  const match = xml.match(regex);
  return match?.[1]?.trim() || undefined;
};

const extractFirstGovTalkError = (xml: string) => {
  const errorMatch = xml.match(/<Error>([\s\S]*?)<\/Error>/);
  const errorXml = errorMatch?.[1] ?? '';

  return {
    number: extractTagValue(errorXml, 'Number'),
    text: extractTagValue(errorXml, 'Text'),
  };
};

export class HmrcTransactionEngineClient {
  constructor(
    private readonly endpoints: GovTalkTransactionEngineEndpoints = {
      submissionUrl: 'https://test-transaction-engine.tax.service.gov.uk/submission',
      pollUrl: 'https://test-transaction-engine.tax.service.gov.uk/poll',
    },
  ) {}

  async submit(xml: string): Promise<GovTalkSubmissionAcknowledgement> {
    const response = await fetch(this.endpoints.submissionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-binary',
      },
      body: xml,
    });

    const rawXml = await response.text();
    const error = extractFirstGovTalkError(rawXml);

    return {
      qualifier: extractTagValue(rawXml, 'Qualifier'),
      correlationId: extractTagValue(rawXml, 'CorrelationID'),
      transactionId: extractTagValue(rawXml, 'TransactionID'),
      responseEndpoint: extractTagValue(rawXml, 'ResponseEndPoint'),
      gatewayTimestamp: extractTagValue(rawXml, 'GatewayTimestamp'),
      errorNumber: error.number,
      errorText: error.text,
      rawXml,
    };
  }

  async poll(xml: string): Promise<GovTalkSubmissionAcknowledgement> {
    const response = await fetch(this.endpoints.pollUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-binary',
      },
      body: xml,
    });

    const rawXml = await response.text();
    const error = extractFirstGovTalkError(rawXml);

    return {
      qualifier: extractTagValue(rawXml, 'Qualifier'),
      correlationId: extractTagValue(rawXml, 'CorrelationID'),
      transactionId: extractTagValue(rawXml, 'TransactionID'),
      responseEndpoint: extractTagValue(rawXml, 'ResponseEndPoint'),
      gatewayTimestamp: extractTagValue(rawXml, 'GatewayTimestamp'),
      errorNumber: error.number,
      errorText: error.text,
      rawXml,
    };
  }
}
