// Logic functions receive each app variable as its own process.env entry.
// Front components receive them all as JSON in process.env.applicationVariables
// (what getApplicationVariable reads). Read both so shared code works in each.
export const readAppVariable = (key: string): string | undefined => {
  const environment =
    typeof process === 'undefined' ? undefined : process.env;
  const direct = environment?.[key];

  if (typeof direct === 'string') {
    return direct;
  }

  const serialized = environment?.applicationVariables;

  if (typeof serialized !== 'string' || serialized === '') {
    return undefined;
  }

  try {
    const value = (JSON.parse(serialized) as Record<string, unknown>)[key];

    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
};
