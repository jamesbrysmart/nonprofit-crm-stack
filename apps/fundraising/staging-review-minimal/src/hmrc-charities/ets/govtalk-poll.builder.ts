const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export interface BuildHmrcGovTalkPollOptions {
  messageClass: string;
  correlationId: string;
}

export const buildHmrcGovTalkPollXml = (
  options: BuildHmrcGovTalkPollOptions,
): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<GovTalkMessage xmlns="http://www.govtalk.gov.uk/CM/envelope">',
    '  <EnvelopeVersion>2.0</EnvelopeVersion>',
    '  <Header>',
    '    <MessageDetails>',
    `      <Class>${escapeXml(options.messageClass)}</Class>`,
    '      <Qualifier>poll</Qualifier>',
    '      <Function>submit</Function>',
    `      <CorrelationID>${escapeXml(options.correlationId)}</CorrelationID>`,
    '      <Transformation>XML</Transformation>',
    '    </MessageDetails>',
    '    <SenderDetails />',
    '  </Header>',
    '  <GovTalkDetails>',
    '    <Keys />',
    '  </GovTalkDetails>',
    '  <Body />',
    '</GovTalkMessage>',
  ].join('\n');
