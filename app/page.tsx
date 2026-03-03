"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { CurrentWeather } from "@/components/current-weather";
import { useWeather } from "@/hooks/use-weather";
import { getRecentQueries } from "@/lib/weather-cache";

export default function Home() {
  const { data, status, error, fetchWeather, fetchByCoords } = useWeather();
  const [recentQueries, setRecentQueries] = useState<string[]>([]);

  useEffect(() => {
    setRecentQueries(getRecentQueries(5));
  }, [data]); // refresh recent list when new data is loaded

  const handleSearch = (city: string, country?: string) => {
    fetchWeather(city, country);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => { },
      { maximumAge: 600000 }
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Weather
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Current conditions via{" "}
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
            <CurrentWeather data={data.data[0]} />
          )}
        </div>
      </main>
    </div>
  );
}
