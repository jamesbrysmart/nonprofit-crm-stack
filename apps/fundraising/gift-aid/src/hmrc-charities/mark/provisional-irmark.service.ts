import { createHash } from 'node:crypto';

const GOVTALK_BODY_PATTERN =
  /<Body(?:\s+xmlns="http:\/\/www\.govtalk\.gov\.uk\/CM\/envelope")?>([\s\S]*?)<\/Body>/;
const IRMARK_ELEMENT_PATTERN = /<IRmark\b[^>]*>[\s\S]*?<\/IRmark>/g;

const extractGovTalkBodyXml = (fullGovTalkMessageXml: string): string => {
  const match = fullGovTalkMessageXml.match(GOVTALK_BODY_PATTERN);
  if (!match) {
    throw new Error('GovTalkMessage Body element not found');
  }

  return match[0];
};

const stripIrmarkElements = (bodyXml: string): string =>
  bodyXml.replace(IRMARK_ELEMENT_PATTERN, '');

export const buildProvisionalCanonicalGovTalkBodyXml = (
  irEnvelopeFragmentXml: string,
): string =>
  `<Body xmlns="http://www.govtalk.gov.uk/CM/envelope">${irEnvelopeFragmentXml}</Body>`;

export const computeProvisionalGatewayIrmark = (
  fullGovTalkMessageXml: string,
): string => {
  const bodyXml = extractGovTalkBodyXml(fullGovTalkMessageXml);
  const canonicalBodyXml = stripIrmarkElements(bodyXml);

  return createHash('sha1').update(canonicalBodyXml, 'utf8').digest('base64');
};
