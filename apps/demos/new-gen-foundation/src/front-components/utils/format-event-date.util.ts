const EVENT_DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Rome',
});

export const formatEventDate = (isoDateTime: string) => EVENT_DATE_FORMAT.format(new Date(isoDateTime));
