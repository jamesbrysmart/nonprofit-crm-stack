export type HmrcCharitiesSoftwareIdentity = {
  vendorId: string;
  productName: string;
  productVersion: string;
};

export type HmrcCharitiesGatewayCredentials = {
  senderId: string;
  password: string;
};

export type HmrcCharitiesClaimIdentity = {
  messageClass: 'HMRC-CHAR-CLM';
  charityIdType: 'CHARID';
  charityId: string;
};

export type HmrcCharitiesName = {
  title?: string;
  forename: string;
  surname: string;
};

export type HmrcCharitiesOrganisation = {
  hmrcReference: string;
  charityName: string;
};

export type HmrcCharitiesAuthorisedOfficial = {
  name: HmrcCharitiesName;
  postcode?: string;
  overseas?: boolean;
  phoneNumber: string;
};

export type HmrcCharitiesRegulator = {
  regName: 'CCEW' | 'CCNI' | 'OSCR';
  regNo?: string;
};

export type HmrcCharitiesDonor = {
  name: HmrcCharitiesName;
  house: string;
  postcode?: string;
  overseas?: boolean;
};

export type HmrcCharitiesGiftAidDonation = {
  date: string;
  total: string;
  donor: HmrcCharitiesDonor;
  sponsored?: boolean;
};

export type HmrcCharitiesClaimPeriod = {
  startDate: string;
  endDate: string;
};

export type HmrcCharitiesClaimInput = {
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
};
