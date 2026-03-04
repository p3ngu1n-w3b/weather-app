import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type {
  WeatherbitForecastResponse,
  WeatherbitErrorResponse,
} from "@/lib/weather-types";

const FORECAST_BASE = "https://api.weatherbit.io/v2.0/forecast/daily";
/** Request 4 days so that after excluding today we still have 3 (tomorrow + 2). */
const FORECAST_DAYS = 4;

function getApiKey(): string | undefined {
  return process.env.WEATHERBIT_API_KEY;
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

  const hasCoords = lat != null && lon != null && lat !== "" && lon !== "";
  const hasCity = city != null && city.trim() !== "";

  if (!hasCoords && !hasCity) {
    return NextResponse.json(
      { error: "Provide either 'city' or 'lat' and 'lon'." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    units: "M",
    days: String(FORECAST_DAYS),
  });
  if (hasCoords) {
    params.set("lat", lat!);
    params.set("lon", lon!);
  } else {
    params.set("city", city!.trim());
    if (country?.trim()) params.set("country", country.trim());
  }

  try {
    const res = await fetch(`${FORECAST_BASE}?${params.toString()}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    const data = (await res.json()) as
      | WeatherbitForecastResponse
      | WeatherbitErrorResponse;

    if (!res.ok) {
      const err = data as WeatherbitErrorResponse;
      return NextResponse.json(
        { error: err.error ?? "Forecast request failed." },
        { status: res.status }
      );
    }

    const forecast = data as WeatherbitForecastResponse;
    if (!forecast.data?.length) {
      return NextResponse.json(
        { error: "No forecast data for this location." },
        { status: 404 }
      );
    }

    return NextResponse.json(forecast);
  } catch (e) {
    console.error("Weatherbit forecast API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch forecast." },
      { status: 502 }
    );
  }
}
