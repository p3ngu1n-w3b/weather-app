"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { CurrentWeather } from "@/components/current-weather";
import { DayDetailView } from "@/components/day-detail-view";
import { ForecastAndHistory } from "@/components/forecast-and-history";
import { useWeather } from "@/hooks/use-weather";
import { useForecastAndHistory } from "@/hooks/use-forecast-history";
import { getRecentQueries, clearRecentQueries } from "@/lib/weather-cache";
import { SA_COUNTRY, SA_TIMEZONE } from "@/lib/constants";
import type { SelectedDay } from "@/lib/weather-types";

export default function Home() {
  const { data, status, error, fetchWeather, fetchByCoords } = useWeather();
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<SelectedDay>(null);
  const pendingCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const dataRef = useRef(data);
  const mainContentRef = useRef<HTMLDivElement>(null);
  dataRef.current = data;

  // When a day tile is selected, scroll the main summary into view so the user sees the result
  useEffect(() => {
    if (selectedDay === null) return;
    const el = mainContentRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedDay]);

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

  const currentLocation = useMemo(() => {
    const cur = data?.data?.[0];
    if (!cur) return null;
    return (
      locationDisplayName?.trim() ||
      [cur.city_name, cur.state_code, cur.country_code].filter(Boolean).join(", ")
    ) || null;
  }, [data, locationDisplayName]);

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

  const handleSelectDay = useCallback((selection: SelectedDay) => {
    setSelectedDay((prev) => {
      if (!selection) return null;
      const key = selection.type === "forecast" ? selection.day.valid_date : selection.day.datetime;
      const prevKey = prev === null ? null : prev.type === "forecast" ? prev.day.valid_date : prev.day.datetime;
      return prevKey === key ? null : selection;
    });
  }, []);

  const handleBackToCurrent = useCallback(() => setSelectedDay(null), []);

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
            // Only apply if we're still showing the result of this "Use my location" request
            // (user hasn't searched for another place). Weatherbit often returns the nearest
            // station name (e.g. Rosebank) which can be km away; we prefer the reverse-geocoded
            // suburb/neighbourhood from the user's actual coordinates.
            const cur = dataRef.current?.data?.[0];
            if (!cur) return;
            const sameRequest =
              Math.abs(cur.lat - pending.lat) < 0.1 &&
              Math.abs(cur.lon - pending.lon) < 0.1;
            if (sameRequest) setLocationDisplayName(body.displayName);
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
    <div className="sky-bg min-h-screen transition-colors duration-300">
      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 sm:pb-20 md:max-w-3xl md:px-8 md:pt-10 md:pb-24">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:mb-10 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl md:text-[1.75rem]">
              South African Weather
            </h1>
            <p className="mt-1 text-xs text-slate-600 md:mt-1.5">
              Via{" "}
              <a
                href="https://www.weatherbit.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-600 underline decoration-sky-300 hover:decoration-sky-500"
              >
                Weatherbit
              </a>
            </p>
          </div>
          <div className="w-full min-w-0 md:max-w-md md:shrink-0">
            <SearchBar
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              onClearRecents={handleClearRecents}
              isLoading={status === "loading"}
              recentQueries={recentQueries}
              currentLocation={currentLocation ?? undefined}
            />
          </div>
        </header>

        <div className="flex flex-col items-center gap-5 sm:gap-6 md:gap-8">
          {status === "loading" && !data && (
            <div
              className="glass-card w-full animate-fade-in rounded-2xl p-10"
              aria-busy="true"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-sky-200/80" />
                <p className="text-sm font-medium text-slate-600">Loading weather…</p>
              </div>
            </div>
          )}

          {status === "error" && error && (
            <div
              className="glass-card w-full animate-fade-in rounded-2xl px-5 py-4 md:px-6 md:py-5"
              role="alert"
            >
              <p className="font-semibold text-slate-800">Unable to load weather</p>
              <p className="mt-1 text-sm text-slate-600">{error}</p>
            </div>
          )}

          {status === "success" && data?.data?.[0] && (
            <div className="weather-card glass-card w-full animate-fade-in-up rounded-2xl overflow-hidden">
              <div ref={mainContentRef} className="scroll-mt-4 sm:scroll-mt-6">
                {selectedDay === null ? (
                  <CurrentWeather
                  data={data.data[0]}
                  locationDisplayName={locationDisplayName}
                  embedded
                />
              ) : selectedDay.type === "forecast" ? (
                <DayDetailView
                  type="forecast"
                  day={selectedDay.day}
                  timezone={forecast?.timezone ?? history?.timezone ?? SA_TIMEZONE}
                  locationName={currentLocation ?? data.data[0].city_name}
                  onBackToCurrent={handleBackToCurrent}
                  embedded
                />
              ) : (
                <DayDetailView
                  type="history"
                  day={selectedDay.day}
                  timezone={forecast?.timezone ?? history?.timezone ?? SA_TIMEZONE}
                  locationName={currentLocation ?? data.data[0].city_name}
                  onBackToCurrent={handleBackToCurrent}
                  embedded
                />
              )}
              </div>
              <ForecastAndHistory
                forecast={forecast}
                history={history}
                forecastStatus={forecastStatus}
                historyStatus={historyStatus}
                forecastError={forecastError}
                historyError={historyError}
                selectedDay={selectedDay}
                onSelectDay={handleSelectDay}
                embedded
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
