"use client";

import { useState } from "react";
import Image from "next/image";
import type {
  WeatherbitForecastDay,
  WeatherbitHistoryDay,
  WeatherbitForecastResponse,
  WeatherbitHistoryResponse,
} from "@/lib/weather-types";
import {
  weatherIconUrl,
  formatDayLabel,
  getTodayInTimezone,
} from "@/lib/weather-utils";
import { SA_TIMEZONE } from "@/lib/constants";

type ViewMode = "grid" | "list";

export interface ForecastAndHistoryProps {
  forecast: WeatherbitForecastResponse | null;
  history: WeatherbitHistoryResponse | null;
  forecastStatus: string;
  historyStatus: string;
  forecastError: string | null;
  historyError: string | null;
}

export function ForecastAndHistory({
  forecast,
  history,
  forecastStatus,
  historyStatus,
  forecastError,
  historyError,
}: ForecastAndHistoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const timezone = forecast?.timezone ?? history?.timezone ?? SA_TIMEZONE;
  const todaySA = getTodayInTimezone(SA_TIMEZONE);

  const forecastDays =
    forecast?.data?.filter((d) => (d.valid_date ?? d.datetime) > todaySA)
      .slice(0, 3) ?? [];
  const historyDays = [...(history?.data ?? [])]
    .filter((d) => (d.datetime ?? "").slice(0, 10) !== todaySA)
    .slice(-3);

  const isLoading =
    forecastStatus === "loading" || historyStatus === "loading";
  const hasData = forecastDays.length > 0 || historyDays.length > 0;

  if (isLoading && !hasData) {
    return (
      <div className="w-full max-w-2xl animate-fade-in rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-800/80">
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading forecast & history…
          </span>
        </div>
      </div>
    );
  }

  if (!hasData && forecastStatus !== "loading" && historyStatus !== "loading") {
    return null;
  }

  const containerClass =
    viewMode === "grid"
      ? "grid gap-3 sm:grid-cols-3"
      : "flex flex-col gap-2";

  return (
    <section
      className="w-full max-w-2xl animate-fade-in-up rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800/80 md:p-8"
      aria-label="3-day forecast and 3-day history"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Forecast & History
        </h2>
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-600">
          <ViewToggleButton
            active={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            label="Grid"
          />
          <ViewToggleButton
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
            label="List"
          />
        </div>
      </div>

      {forecastDays.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Next 3 days
          </h3>
          <ul className={containerClass} role="list">
            {forecastDays.map((day) => (
              <li key={day.valid_date ?? day.datetime}>
                <ForecastDayCard
                  day={day}
                  variant={viewMode}
                  timezone={timezone}
                />
              </li>
            ))}
          </ul>
          {forecastError && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {forecastError}
            </p>
          )}
        </div>
      )}

      {historyDays.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Past 3 days
          </h3>
          <ul className={containerClass} role="list">
            {historyDays.map((day) => (
              <li key={day.datetime}>
                <HistoryDayCard
                  day={day}
                  variant={viewMode}
                  timezone={timezone}
                />
              </li>
            ))}
          </ul>
          {historyError && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {historyError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function ViewToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition first:rounded-l-lg last:rounded-r-lg ${active
        ? "bg-sky-600 text-white dark:bg-sky-500"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
        }`}
    >
      {label}
    </button>
  );
}

function ForecastDayCard({
  day,
  variant,
  timezone,
}: {
  day: WeatherbitForecastDay;
  variant: ViewMode;
  timezone: string;
}) {
  const iconUrl = weatherIconUrl(day.weather.icon);
  const label = formatDayLabel(
    day.valid_date ?? day.datetime,
    timezone
  );

  const content = (
    <>
      <div className="flex items-center gap-2">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={iconUrl}
            alt={day.weather.description}
            width={40}
            height={40}
            unoptimized
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {label}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {day.weather.description}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-sm">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {Math.round(day.high_temp)}° / {Math.round(day.low_temp)}°
        </span>
        {day.precip > 0 && (
          <span className="text-zinc-500 dark:text-zinc-400">
            {day.precip} mm
          </span>
        )}
      </div>
      {(day.wind_spd > 0 || day.rh > 0) && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Wind {day.wind_spd} m/s · {day.rh}% humidity
        </p>
      )}
    </>
  );

  const baseClass =
    "rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-600 dark:bg-zinc-700/50";

  return (
    <article
      className={
        variant === "list" ? `flex items-center gap-4 ${baseClass}` : baseClass
      }
    >
      {content}
    </article>
  );
}

function HistoryDayCard({
  day,
  variant,
  timezone,
}: {
  day: WeatherbitHistoryDay;
  variant: ViewMode;
  timezone: string;
}) {
  const label = formatDayLabel(day.datetime, timezone);

  const content = (
    <>
      <p className="font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
        {Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°
      </p>
      {(day.precip != null && day.precip > 0) && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Precip {day.precip} mm
        </p>
      )}
      {day.wind_spd != null && day.wind_spd > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Wind {day.wind_spd} m/s
        </p>
      )}
    </>
  );

  const baseClass =
    "rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-600 dark:bg-zinc-700/50";

  return (
    <article
      className={
        variant === "list" ? `flex items-center gap-4 ${baseClass}` : baseClass
      }
    >
      {content}
    </article>
  );
}
