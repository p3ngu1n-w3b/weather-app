import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { WeatherbitCurrentResponse, WeatherbitErrorResponse } from "@/lib/weather-types";

const WEATHERBIT_BASE = "https://api.weatherbit.io/v2.0/current";

function getApiKey(): string | undefined {
  return process.env.WEATHERBIT_API_KEY;
}

function buildUrl(searchParams: URLSearchParams): string {
  const key = getApiKey();
  if (!key) return "";

  const params = new URLSearchParams(searchParams);
  params.set("key", key);
  params.set("units", "M"); // Metric by default
  return `${WEATHERBIT_BASE}?${params.toString()}`;
}

/**
 * GET /api/weather
 * Query params:
 *   - city: city name (e.g. "London")
 *   - country: optional country code (e.g. "UK")
 *   - lat, lon: optional; use instead of city for coordinates
 */
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

  const hasCoords = lat != null && lon != null && lat !== "" && lon !== "";
  const hasCity = city != null && city.trim() !== "";

  if (!hasCoords && !hasCity) {
    return NextResponse.json(
      { error: "Provide either 'city' or 'lat' and 'lon'." },
      { status: 400 }
    );
  }

  const query = new URLSearchParams();
  if (hasCoords) {
    query.set("lat", lat!);
    query.set("lon", lon!);
  } else {
    query.set("city", city!.trim());
    if (country?.trim()) query.set("country", country.trim());
  }

  const url = buildUrl(query);
  if (!url) {
    return NextResponse.json({ error: "Missing API key." }, { status: 503 });
  }

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 }, // 10 min server cache
      headers: { Accept: "application/json" },
    });
    const data = (await res.json()) as WeatherbitCurrentResponse | WeatherbitErrorResponse;

    if (!res.ok) {
      const err = data as WeatherbitErrorResponse;
      return NextResponse.json(
        { error: err.error ?? "Weather request failed." },
        { status: res.status }
      );
    }

    const current = data as WeatherbitCurrentResponse;
    if (!current.data?.length) {
      return NextResponse.json(
        { error: "No weather data found for this location." },
        { status: 404 }
      );
    }

    return NextResponse.json(current);
  } catch (e) {
    console.error("Weatherbit API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch weather." },
      { status: 502 }
    );
  }
}
