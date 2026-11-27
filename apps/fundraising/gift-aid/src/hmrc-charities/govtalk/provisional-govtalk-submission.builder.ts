import { HmrcCharitiesClaimInput } from '../types';
import {
  buildProvisionalCanonicalGovTalkBodyXml,
  computeProvisionalGatewayIrmark,
} from '../mark/provisional-irmark.service';
import { buildProvisionalHmrcCharitiesClaimIrEnvelopeFragmentXml } from '../body/provisional-claim-ir-envelope.builder';

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export type BuildProvisionalGovTalkSubmissionOptions = {
  gatewayTimestamp?: string;
  gatewayTest?: boolean;
  correlationId?: string;
};

export const buildProvisionalHmrcCharitiesGovTalkSubmissionXml = (
  claim: HmrcCharitiesClaimInput,
  options: BuildProvisionalGovTalkSubmissionOptions,
): string => {
  const placeholderIrmark = 'PLACEHOLDER_IRMARK';
  const provisionalSubmissionWithPlaceholderIrmark =
    buildGovTalkSubmissionXml(
      claim,
      options,
      buildProvisionalHmrcCharitiesClaimIrEnvelopeFragmentXml(
        claim,
        placeholderIrmark,
      ),
    );
  const irmark = computeProvisionalGatewayIrmark(
    provisionalSubmissionWithPlaceholderIrmark,
  );
  const irEnvelopeWithIrmark =
    buildProvisionalHmrcCharitiesClaimIrEnvelopeFragmentXml(
      claim,
      irmark,
    );

  return buildGovTalkSubmissionXml(claim, options, irEnvelopeWithIrmark);
};

const buildGovTalkSubmissionXml = (
  claim: HmrcCharitiesClaimInput,
  options: BuildProvisionalGovTalkSubmissionOptions,
  irEnvelopeXml: string,
): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<GovTalkMessage xmlns="http://www.govtalk.gov.uk/CM/envelope">',
    '  <EnvelopeVersion>2.0</EnvelopeVersion>',
    '  <Header>',
    '    <MessageDetails>',
    `      <Class>${escapeXml(claim.identity.messageClass)}</Class>`,
    '      <Qualifier>request</Qualifier>',
    '      <Function>submit</Function>',
    `      <CorrelationID>${escapeXml(options.correlationId ?? '')}</CorrelationID>`,
    '      <Transformation>XML</Transformation>',
    options.gatewayTest ? '      <GatewayTest>1</GatewayTest>' : '',
    options.gatewayTimestamp
      ? `      <GatewayTimestamp>${escapeXml(options.gatewayTimestamp)}</GatewayTimestamp>`
      : '',
    '    </MessageDetails>',
    '    <SenderDetails>',
    '      <IDAuthentication>',
    `        <SenderID>${escapeXml(claim.gateway.senderId)}</SenderID>`,
    '        <Authentication>',
    '          <Method>clear</Method>',
    '          <Role>principal</Role>',
    `          <Value>${escapeXml(claim.gateway.password)}</Value>`,
    '        </Authentication>',
    '      </IDAuthentication>',
    '    </SenderDetails>',
    '  </Header>',
    '  <GovTalkDetails>',
    `    <Keys><Key Type="${escapeXml(claim.identity.charityIdType)}">${escapeXml(claim.identity.charityId)}</Key></Keys>`,
    '    <TargetDetails><Organisation>HMRC</Organisation></TargetDetails>',
    '    <ChannelRouting>',
    '      <Channel>',
    `        <URI>${escapeXml(claim.software.vendorId)}</URI>`,
    `        <Product>${escapeXml(claim.software.productName)}</Product>`,
    `        <Version>${escapeXml(claim.software.productVersion)}</Version>`,
    '      </Channel>',
    '    </ChannelRouting>',
    '  </GovTalkDetails>',
    `  ${buildProvisionalCanonicalGovTalkBodyXml(irEnvelopeXml)}`,
    '</GovTalkMessage>',
  ]
    .filter(Boolean)
    .join('\n');
