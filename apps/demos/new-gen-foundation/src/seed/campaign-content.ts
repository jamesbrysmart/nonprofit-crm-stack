// Invitation emails for the New Ballet open rehearsal, as Twenty email documents.
type Inline = { type: 'text'; text: string } | { type: 'variableTag'; attrs: { variable: string } };

const text = (value: string): Inline => ({ type: 'text', text: value });
const firstName: Inline = { type: 'variableTag', attrs: { variable: '{{name.firstName}}' } };
const paragraph = (...content: Inline[]) => ({ type: 'paragraph', content });
const bullets = (...items: string[]) => ({
  type: 'bulletList',
  content: items.map((item) => ({ type: 'listItem', content: [paragraph(text(item))] })),
});

type InvitationCopy = {
  heading: string;
  greeting: string;
  body: string[];
  details: string[];
  button: string;
  signOff: string;
  signature: string;
};

const buildDocument = (copy: InvitationCopy) => ({
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [
    {
      type: 'section',
      attrs: { style: { backgroundColor: '#f6f1ea', paddingTop: '28px', paddingRight: '28px', paddingBottom: '28px', paddingLeft: '28px' } },
      content: [
        { type: 'heading', attrs: { level: 1, style: null }, content: [text(copy.heading)] },
        paragraph(text(copy.greeting), firstName, text(',')),
        ...copy.body.map((line) => paragraph(text(line))),
        bullets(...copy.details),
        {
          type: 'button',
          attrs: {
            href: 'mailto:eventi@ngf-demo.example.org?subject=New%20Ballet%20open%20rehearsal',
            style: { backgroundColor: '#5b2a86', color: '#ffffff', paddingTop: '12px', paddingRight: '20px', paddingBottom: '12px', paddingLeft: '20px' },
          },
          content: [text(copy.button)],
        },
        paragraph(text(copy.signOff)),
        paragraph(text(copy.signature)),
      ],
    },
  ],
});

export const CAMPAIGN_INVITATIONS = [
  {
    language: 'IT',
    listName: 'Prova aperta New Ballet: invitati (italiano)',
    listDescription: 'Invitati alla prova aperta del 5 dicembre con lingua preferita italiano.',
    campaignName: 'Invito: prova aperta New Ballet (IT)',
    subject: '{{name.firstName}}, una serata in sala prove con New Ballet',
    document: buildDocument({
      heading: 'Una serata in sala prove con New Ballet',
      greeting: 'Gentile ',
      body: [
        'Sabato 5 dicembre, Sofia Lenz e i danzatori fondatori di Nouveaux Ballets Russes / New Ballet aprono la loro sala prove a un piccolo gruppo di amici della Fondazione.',
        'Assisterete alle prove della prima creazione della compagnia, incontrerete i danzatori e resterete con noi per una cena leggera.',
      ],
      details: ['Sabato 5 dicembre 2026, ore 18:30', 'Spazio Danza Le Cascine, Firenze', 'Posti limitati a 40 ospiti'],
      button: 'Rispondi per confermare',
      signOff: 'Con i più cordiali saluti,',
      signature: "L'ufficio Sviluppo, New Generation Foundation",
    }),
  },
  {
    language: 'EN',
    listName: 'New Ballet open rehearsal: invitees (English)',
    listDescription: 'Invitees to the 5 December open rehearsal whose preferred language is English.',
    campaignName: 'Invitation: New Ballet open rehearsal (EN)',
    subject: '{{name.firstName}}, an evening in the studio with New Ballet',
    document: buildDocument({
      heading: 'An evening in the studio with New Ballet',
      greeting: 'Dear ',
      body: [
        'On Saturday 5 December, Sofia Lenz and the founding dancers of Nouveaux Ballets Russes / New Ballet open their studio to a small group of friends of the Foundation.',
        "Watch a rehearsal of the company's first creation, meet the dancers and stay with us for a light supper.",
      ],
      details: ['Saturday 5 December 2026, 6.30pm', 'Spazio Danza Le Cascine, Florence', 'Places are limited to 40 guests'],
      button: 'Reply to accept',
      signOff: 'With warm wishes,',
      signature: 'The Development team, New Generation Foundation',
    }),
  },
] as const;
