"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { CurrentWeather } from "@/components/current-weather";
import { ForecastAndHistory } from "@/components/forecast-and-history";
import { useWeather } from "@/hooks/use-weather";
import { useForecastAndHistory } from "@/hooks/use-forecast-history";
import { getRecentQueries, clearRecentQueries } from "@/lib/weather-cache";
import { SA_COUNTRY, SA_TIMEZONE } from "@/lib/constants";

export default function Home() {
  const { data, status, error, fetchWeather, fetchByCoords } = useWeather();
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);
  const pendingCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  const coords = useMemo(() => {
    const cur = data?.data?.[0];
    if (!cur?.lat || !cur?.lon) return null;
    return {
      lat: cur.lat,
      lon: cur.lon,
      city: cur.city_name,
      country: SA_COUNTRY,
      timezone: SA_TIMEZONE,
    };
  }, [data]);

  const {
    forecast,
    history,
    forecastStatus,
    historyStatus,
    forecastError,
    historyError,
  } = useForecastAndHistory(coords);

  useEffect(() => {
    setRecentQueries(getRecentQueries(5));
  }, [data]); // refresh recent list when new data is loaded

  const handleClearRecents = useCallback(() => {
    clearRecentQueries();
    setRecentQueries([]);
  }, []);

  const handleSearch = useCallback(
    (city: string) => {
      setLocationDisplayName(null);
      pendingCoordsRef.current = null;
      fetchWeather(city, SA_COUNTRY);
    },
    [fetchWeather]
  );

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocationDisplayName(null);
    pendingCoordsRef.current = null;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        pendingCoordsRef.current = { lat, lon };
        fetchByCoords(lat, lon);
        fetch(`/api/geocode/reverse?${new URLSearchParams({ lat: String(lat), lon: String(lon) })}`)
          .then((r) => r.json())
          .then((body) => {
            const pending = pendingCoordsRef.current;
            if (!pending || !body?.displayName) return;
            const cur = dataRef.current?.data?.[0];
            const matches =
              cur &&
              Math.abs(cur.lat - pending.lat) < 0.02 &&
              Math.abs(cur.lon - pending.lon) < 0.02;
            if (matches) setLocationDisplayName(body.displayName);
          })
          .catch(() => { });
      },
      () => { },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [fetchByCoords]);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <main className="mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            South African Weather
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Current conditions for cities in South Africa via{" "}
            <a
              href="https://www.weatherbit.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Weatherbit
            </a>
          </p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <SearchBar
            onSearch={handleSearch}
            onUseLocation={handleUseLocation}
            onClearRecents={handleClearRecents}
            isLoading={status === "loading"}
            recentQueries={recentQueries}
          />

          {status === "loading" && !data && (
            <div
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 dark:border-zinc-700 dark:bg-zinc-800/80"
              aria-busy="true"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-sky-200 dark:bg-sky-800" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading weather…</p>
              </div>
            </div>
          )}

          {status === "error" && error && (
            <div
              className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
              role="alert"
            >
              <p className="font-medium">Unable to load weather</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {status === "success" && data?.data?.[0] && (
            <>
              <CurrentWeather
                data={data.data[0]}
                locationDisplayName={locationDisplayName}
              />
              <ForecastAndHistory
                forecast={forecast}
                history={history}
                forecastStatus={forecastStatus}
                historyStatus={historyStatus}
                forecastError={forecastError}
                historyError={historyError}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
