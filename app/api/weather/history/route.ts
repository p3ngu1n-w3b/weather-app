import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type {
  WeatherbitHistoryResponse,
  WeatherbitErrorResponse,
} from "@/lib/weather-types";

const HISTORY_BASE = "https://api.weatherbit.io/v2.0/history/daily";

function getApiKey(): string | undefined {
  return process.env.WEATHERBIT_API_KEY;
}

/**
 * Format a date as YYYY-MM-DD in the given IANA timezone.
 * Uses Intl so "today" and "yesterday" match the location, not server UTC.
 */
function toYYYYMMDDInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/** Request through today so we get yesterday (3rd) when API returns it; we exclude today when displaying. */
function getHistoryDateRange(timezone: string): {
  start_date: string;
  end_date: string;
} {
  const now = new Date();
  const todayStr = toYYYYMMDDInTimezone(now, timezone);
  const [y, m, d] = todayStr.split("-").map(Number);
  const todayAtUTC = new Date(Date.UTC(y, m - 1, d));
  const startAtUTC = new Date(todayAtUTC);
  startAtUTC.setUTCDate(startAtUTC.getUTCDate() - 4);
  return {
    start_date: toYYYYMMDDInTimezone(startAtUTC, timezone),
    end_date: todayStr,
  };
}

export async function GET(request: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API is not configured. Set WEATHERBIT_API_KEY." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const timezone = searchParams.get("timezone") ?? "UTC";

  const hasCoords = lat != null && lon != null && lat !== "" && lon !== "";
  const hasCity = city != null && city.trim() !== "";

  if (!hasCoords && !hasCity) {
    return NextResponse.json(
      { error: "Provide either 'city' or 'lat' and 'lon'." },
      { status: 400 }
    );
  }

  const { start_date, end_date } = getHistoryDateRange(timezone);
  const params = new URLSearchParams({
    key: apiKey,
    units: "M",
    start_date,
    end_date,
  });
  if (hasCoords) {
    params.set("lat", lat!);
    params.set("lon", lon!);
  } else {
    params.set("city", city!.trim());
    if (country?.trim()) params.set("country", country.trim());
  }

  try {
    const res = await fetch(`${HISTORY_BASE}?${params.toString()}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    const data = (await res.json()) as
      | WeatherbitHistoryResponse
      | WeatherbitErrorResponse;

    if (!res.ok) {
      const err = data as WeatherbitErrorResponse;
      return NextResponse.json(
        { error: err.error ?? "History request failed." },
        { status: res.status }
      );
    }

    const history = data as WeatherbitHistoryResponse;
    return NextResponse.json(history);
  } catch (e) {
    console.error("Weatherbit history API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch history." },
      { status: 502 }
    );
  }
}
