/**
 * Weather icon URL from Weatherbit CDN.
 * @see https://www.weatherbit.io/api/codes
 */
const ICON_BASE = "https://cdn.weatherbit.io/static/img/icons";

export function weatherIconUrl(iconCode: string): string {
  return `${ICON_BASE}/${iconCode}.png`;
}
