export interface HmrcCharitiesSoftwareIdentity {
  vendorId: string;
  productName: string;
  productVersion: string;
}

export interface HmrcCharitiesGatewayCredentials {
  senderId: string;
  password: string;
}

export interface HmrcCharitiesClaimIdentity {
  messageClass: 'HMRC-CHAR-CLM';
  charityIdType: 'CHARID';
  charityId: string;
}

export interface HmrcCharitiesName {
  title?: string;
  forename: string;
  surname: string;
}

export interface HmrcCharitiesOrganisation {
  hmrcReference: string;
  charityName: string;
}

export interface HmrcCharitiesAuthorisedOfficial {
  name: HmrcCharitiesName;
  postcode?: string;
  overseas?: boolean;
  phoneNumber: string;
}

export interface HmrcCharitiesRegulator {
  regName: 'CCEW' | 'CCNI' | 'OSCR';
  regNo?: string;
}

export interface HmrcCharitiesDonor {
  name: HmrcCharitiesName;
  house: string;
  postcode?: string;
  overseas?: boolean;
}

export interface HmrcCharitiesGiftAidDonation {
  date: string;
  total: string;
  donor: HmrcCharitiesDonor;
  sponsored?: boolean;
}

export interface HmrcCharitiesClaimPeriod {
  startDate: string;
  endDate: string;
}

export interface HmrcCharitiesClaimInput {
  software: HmrcCharitiesSoftwareIdentity;
  gateway: HmrcCharitiesGatewayCredentials;
  identity: HmrcCharitiesClaimIdentity;
  organisation: HmrcCharitiesOrganisation;
  authorisedOfficial: HmrcCharitiesAuthorisedOfficial;
  regulator?: HmrcCharitiesRegulator;
  claimPeriod: HmrcCharitiesClaimPeriod;
  declaration: 'yes';
  defaultCurrency?: 'GBP';
  sender: 'Individual';
  donations: HmrcCharitiesGiftAidDonation[];
}
