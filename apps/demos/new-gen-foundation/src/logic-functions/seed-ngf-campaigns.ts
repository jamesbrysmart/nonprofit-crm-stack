import { defineLogicFunction } from 'twenty-sdk/define';

import { CAMPAIGN_INVITATIONS } from 'src/seed/campaign-content';
import { graphql } from 'src/utils/graphql';

const FROM_ADDRESS = 'eventi@ngf-demo.example.org';
const REHEARSAL_EVENT_NAME = "New Ballet: Patrons' Open Rehearsal";

type GuestEdge = { node: { guestRole: string | null; person: { id: string; preferredLanguage: string | null } | null } };

// Creates the open-rehearsal invitation lists (split by preferred language) and draft campaigns.
const handler = async () => {
  const existing = await graphql<{ messageCampaigns: { totalCount: number } }>(
    `query($name: String!) { messageCampaigns(filter: { name: { eq: $name } }) { totalCount } }`,
    { name: CAMPAIGN_INVITATIONS[0].campaignName },
  );
  if (existing.messageCampaigns.totalCount > 0) {
    return { message: 'Invitation campaigns already present; nothing created.' };
  }

  const guests = await graphql<{ eventGuests: { edges: GuestEdge[] } }>(
    `query($name: String!) {
      eventGuests(filter: { foundationEvent: { name: { eq: $name } } }, first: 200) {
        edges { node { guestRole person { id preferredLanguage } } }
      }
    }`,
    { name: REHEARSAL_EVENT_NAME },
  );
  const invitees = guests.eventGuests.edges
    .map((edge) => edge.node)
    .filter((guest) => guest.guestRole !== 'PERFORMER' && guest.person !== null);

  const created: Array<{ campaign: string; recipients: number }> = [];
  for (const invitation of CAMPAIGN_INVITATIONS) {
    const personIds = invitees
      .filter((guest) => (guest.person?.preferredLanguage === 'IT') === (invitation.language === 'IT'))
      .map((guest) => guest.person!.id);

    const { createMessageList } = await graphql<{ createMessageList: { id: string } }>(
      `mutation($data: MessageListCreateInput!) { createMessageList(data: $data) { id } }`,
      { data: { name: invitation.listName, description: invitation.listDescription } },
    );
    if (personIds.length > 0) {
      await graphql(
        `mutation($data: [MessageListMemberCreateInput!]!) { createMessageListMembers(data: $data) { id } }`,
        { data: personIds.map((personId) => ({ listId: createMessageList.id, personId })) },
      );
    }
    await graphql(
      `mutation($data: MessageCampaignCreateInput!) { createMessageCampaign(data: $data) { id } }`,
      {
        data: {
          name: invitation.campaignName,
          subject: invitation.subject,
          bodyTemplate: JSON.stringify(invitation.document),
          fromAddress: { primaryEmail: FROM_ADDRESS },
          listId: createMessageList.id,
        },
      },
    );
    created.push({ campaign: invitation.campaignName, recipients: personIds.length });
  }

  return { message: 'Invitation lists and draft campaigns created.', created };
};

export default defineLogicFunction({
  universalIdentifier: '09b9c9fc-fbb1-4c97-b2e8-e52c1ab64bb9',
  name: 'seed-ngf-campaigns',
  description:
    'Creates the New Ballet open rehearsal invitation lists (Italian and English) and their draft campaigns. Does nothing if they already exist.',
  timeoutSeconds: 60,
  handler,
});
