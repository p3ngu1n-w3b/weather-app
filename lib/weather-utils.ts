/**
 * Weather icon URL from Weatherbit CDN.
 * @see https://www.weatherbit.io/api/codes
 */
const ICON_BASE = "https://cdn.weatherbit.io/static/img/icons";

export function weatherIconUrl(iconCode: string): string {
  return `${ICON_BASE}/${iconCode}.png`;
}

/**
 * Return today's date as YYYY-MM-DD in the given IANA timezone (e.g. "Africa/Johannesburg").
 * Used for forecast filter and history API so dates align with South African time.
 */
export function getTodayInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Format Weatherbit current weather datetime (e.g. "2025-03-04:12") as a readable date.
 */
export function formatCurrentWeatherDate(
  datetime: string,
  timezone?: string
): string {
  const datePart = datetime.includes(":") ? datetime.split(":")[0] : datetime.slice(0, 10);
  const d = new Date(datePart + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  if (timezone) {
    return d.toLocaleDateString("en-ZA", { ...options, timeZone: timezone });
  }
  return d.toLocaleDateString("en-ZA", options);
}

/** Format YYYY-MM-DD as short label e.g. "Wed, Mar 5", optionally in a specific timezone. */
export function formatDayLabel(dateStr: string, timezone?: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  if (timezone) {
    return d.toLocaleDateString("en-US", { ...options, timeZone: timezone });
  }
  return d.toLocaleDateString("en-US", options);
}
