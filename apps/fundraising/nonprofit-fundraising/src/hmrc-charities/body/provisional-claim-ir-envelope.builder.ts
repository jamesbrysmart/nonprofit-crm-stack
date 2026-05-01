import {
  HmrcCharitiesClaimInput,
  HmrcCharitiesGiftAidDonation,
  HmrcCharitiesName,
} from '../types';

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const buildNameElement = (
  elementName: string,
  name: HmrcCharitiesName,
): string => {
  return [
    `      <${elementName}>`,
    name.title ? `        <Ttl>${escapeXml(name.title)}</Ttl>` : '',
    `        <Fore>${escapeXml(name.forename)}</Fore>`,
    `        <Sur>${escapeXml(name.surname)}</Sur>`,
    `      </${elementName}>`,
  ]
    .filter(Boolean)
    .join('\n');
};

const buildGiftAidDonationElement = (
  donation: HmrcCharitiesGiftAidDonation,
): string => {
  const sponsoredFlag = donation.sponsored ? '<Sponsored>true</Sponsored>' : '';
  const donorLocation = donation.donor.overseas
    ? '          <Overseas>yes</Overseas>'
    : `          <Postcode>${escapeXml(donation.donor.postcode ?? '')}</Postcode>`;

  return [
    '        <GAD>',
    '          <Donor>',
    donation.donor.name.title
      ? `            <Ttl>${escapeXml(donation.donor.name.title)}</Ttl>`
      : '',
    `            <Fore>${escapeXml(donation.donor.name.forename)}</Fore>`,
    `            <Sur>${escapeXml(donation.donor.name.surname)}</Sur>`,
    `            <House>${escapeXml(donation.donor.house)}</House>`,
    donorLocation,
    '          </Donor>',
    sponsoredFlag ? `          ${sponsoredFlag}` : '',
    `          <Date>${escapeXml(donation.date)}</Date>`,
    `          <Total>${escapeXml(donation.total)}</Total>`,
    '        </GAD>',
  ]
    .filter(Boolean)
    .join('\n');
};

const buildIrmarkElement = (irmark: string | undefined): string =>
  irmark
    ? `    <IRmark Type="generic">${escapeXml(irmark)}</IRmark>`
    : '';

const findEarliestGiftAidDate = (
  donations: HmrcCharitiesGiftAidDonation[],
): string | undefined => {
  if (donations.length === 0) {
    return undefined;
  }

  return [...donations]
    .map((donation) => donation.date)
    .sort((left, right) => left.localeCompare(right))[0];
};

export const buildProvisionalHmrcCharitiesClaimIrEnvelopeFragmentXml = (
  claim: HmrcCharitiesClaimInput,
  irmark?: string,
): string => {
  const giftsXml = claim.donations.map(buildGiftAidDonationElement).join('\n');
  const earliestGiftAidDate = findEarliestGiftAidDate(claim.donations);
  const officialId = claim.authorisedOfficial.overseas
    ? '      <OffID>\n        <Overseas>yes</Overseas>\n      </OffID>'
    : `      <OffID>\n        <Postcode>${escapeXml(claim.authorisedOfficial.postcode ?? '')}</Postcode>\n      </OffID>`;
  const regulatorXml = claim.regulator
    ? [
        '      <Regulator>',
        `        <RegName>${escapeXml(claim.regulator.regName)}</RegName>`,
        claim.regulator.regNo
          ? `        <RegNo>${escapeXml(claim.regulator.regNo)}</RegNo>`
          : '',
        '      </Regulator>',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return [
    '<IRenvelope xmlns="http://www.govtalk.gov.uk/taxation/charities/r68/2">',
    '  <IRheader>',
    `    <Keys><Key Type="${escapeXml(claim.identity.charityIdType)}">${escapeXml(claim.identity.charityId)}</Key></Keys>`,
    `    <PeriodEnd>${escapeXml(claim.claimPeriod.endDate)}</PeriodEnd>`,
    claim.defaultCurrency
      ? `    <DefaultCurrency>${escapeXml(claim.defaultCurrency)}</DefaultCurrency>`
      : '',
    buildIrmarkElement(irmark),
    `    <Sender>${escapeXml(claim.sender)}</Sender>`,
    '  </IRheader>',
    '  <R68>',
    '    <AuthOfficial>',
    buildNameElement('OffName', claim.authorisedOfficial.name),
    officialId,
    `      <Phone>${escapeXml(claim.authorisedOfficial.phoneNumber)}</Phone>`,
    '    </AuthOfficial>',
    `    <Declaration>${escapeXml(claim.declaration)}</Declaration>`,
    '    <Claim>',
    `      <OrgName>${escapeXml(claim.organisation.charityName)}</OrgName>`,
    `      <HMRCref>${escapeXml(claim.organisation.hmrcReference)}</HMRCref>`,
    regulatorXml,
    '      <Repayment>',
    giftsXml,
    earliestGiftAidDate
      ? `        <EarliestGAdate>${escapeXml(earliestGiftAidDate)}</EarliestGAdate>`
      : '',
    '      </Repayment>',
    '    </Claim>',
    '  </R68>',
    '</IRenvelope>',
  ]
    .filter(Boolean)
    .join('\n');
};
