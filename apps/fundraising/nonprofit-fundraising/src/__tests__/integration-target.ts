// Integration tests uninstall the app and delete its data, so they only run
// against a target configured for that purpose. Generic TWENTY_API_* values
// (for example from the fixture script or another project) are never used,
// and there is deliberately no default workspace.
export const resolveIntegrationTarget = (
  env: Record<string, string | undefined>,
): { TWENTY_API_URL: string; TWENTY_API_KEY: string } => ({
  TWENTY_API_URL: env.TWENTY_INTEGRATION_API_URL?.trim() ?? '',
  TWENTY_API_KEY: env.TWENTY_INTEGRATION_API_KEY?.trim() ?? '',
});
