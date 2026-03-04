import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Reverse geocode lat/lon to a short display name using OSM Nominatim.
 * Used for "Use my location" so we show a precise place name (suburb/neighbourhood)
 * instead of the weather station name from Weatherbit.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (lat == null || lon == null || lat === "" || lon === "") {
    return NextResponse.json(
      { error: "lat and lon required." },
      { status: 400 }
    );
  }

  const numLat = Number(lat);
  const numLon = Number(lon);
  if (Number.isNaN(numLat) || Number.isNaN(numLon)) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      lat: String(numLat),
      lon: String(numLon),
      format: "json",
      addressdetails: "1",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "SouthAfricanWeatherApp/1.0 (weather app; precise location label)",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Reverse geocode failed." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      address?: {
        suburb?: string;
        neighbourhood?: string;
        village?: string;
        town?: string;
        city?: string;
        municipality?: string;
        state?: string;
        country?: string;
      };
      display_name?: string;
    };

    const addr = data?.address;
    if (!addr) {
      return NextResponse.json(
        { displayName: data?.display_name ?? "Your location" },
        { status: 200 }
      );
    }

    const parts: string[] = [];
    const suburb =
      addr.suburb ??
      addr.neighbourhood ??
      addr.village ??
      addr.municipality;
    if (suburb) parts.push(suburb);
    const city = addr.city ?? addr.town;
    if (city && city !== suburb) parts.push(city);
    if (addr.state && !parts.includes(addr.state)) parts.push(addr.state);
    if (addr.country && addr.country !== "South Africa") parts.push(addr.country);

    const displayName =
      parts.length > 0 ? parts.join(", ") : data?.display_name ?? "Your location";

    return NextResponse.json({ displayName });
  } catch (e) {
    console.error("Reverse geocode error:", e);
    return NextResponse.json(
      { error: "Failed to get location name." },
      { status: 502 }
    );
  }
}
