import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: 'TODO',
  displayName: 'Gift Aid',
  description: 'UK Gift Aid extensions for fundraising workspaces.',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'TODO',
      isSecret: true,
      value: '',
      description: 'Workspace API key used by Gift Aid functions.',
    },
    TWENTY_API_BASE_URL: {
      universalIdentifier: 'TODO',
      isSecret: false,
      value: 'http://localhost:3000/rest',
      description:
        'REST base URL used by Gift Aid functions. Override for cloud workspaces.',
    },
  },
};

export default config;
