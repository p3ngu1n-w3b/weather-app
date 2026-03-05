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
      <div className="glass-card w-full animate-fade-in rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500 dark:border-slate-600 dark:border-t-sky-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
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
      ? "grid gap-3 sm:grid-cols-3 md:gap-4"
      : "flex flex-col gap-2 md:gap-3";

  return (
    <section
      className="weather-card glass-card w-full animate-fade-in-up rounded-2xl p-5 sm:p-6 md:p-8"
      aria-label="3-day forecast and 3-day history"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 md:mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 sm:text-xl md:text-2xl">
          Forecast & History
        </h2>
        <div className="flex rounded-xl bg-slate-100/80 dark:bg-slate-800/50 p-0.5">
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
        <div className="mb-6 md:mb-8">
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 md:mb-3">
            Next 3 days
          </h3>
          <ul className={containerClass} role="list">
            {forecastDays.map((day, i) => (
              <li
                key={day.valid_date ?? day.datetime}
                className="animate-stagger-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
              >
                <ForecastDayCard
                  day={day}
                  variant={viewMode}
                  timezone={timezone}
                />
              </li>
            ))}
          </ul>
          {forecastError && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {forecastError}
            </p>
          )}
        </div>
      )}

      {historyDays.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Past 3 days
          </h3>
          <ul className={containerClass} role="list">
            {historyDays.map((day, i) => (
              <li
                key={day.datetime}
                className="animate-stagger-in"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
              >
                <HistoryDayCard
                  day={day}
                  variant={viewMode}
                  timezone={timezone}
                />
              </li>
            ))}
          </ul>
          {historyError && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
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
      className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition first:rounded-l-lg last:rounded-r-lg ${active
        ? "bg-sky-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-700/80"
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
      <div className="flex items-center gap-2.5">
        <div className="relative h-10 w-10 shrink-0 animate-wind-drift sm:h-11 sm:w-11">
          <Image
            src={iconUrl}
            alt={day.weather.description}
            width={44}
            height={44}
            unoptimized
            className="object-contain drop-shadow-sm"
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {label}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {day.weather.description}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-sm">
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {Math.round(day.high_temp)}° / {Math.round(day.low_temp)}°
        </span>
        {day.precip > 0 && (
          <span className="text-slate-500 dark:text-slate-400">
            {day.precip} mm
          </span>
        )}
      </div>
      {(day.wind_spd > 0 || day.rh > 0) && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Wind {day.wind_spd} m/s · {day.rh}% humidity
        </p>
      )}
    </>
  );

  const baseClass =
    "rounded-xl bg-slate-100/80 p-3.5 transition hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 md:p-4";

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
      <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        {Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°
      </p>
      {(day.precip != null && day.precip > 0) && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Precip {day.precip} mm
        </p>
      )}
      {day.wind_spd != null && day.wind_spd > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Wind {day.wind_spd} m/s
        </p>
      )}
    </>
  );

  const baseClass =
    "rounded-xl bg-slate-100/80 p-3.5 transition hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 md:p-4";

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
