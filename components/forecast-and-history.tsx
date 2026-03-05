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
import type { SelectedDay } from "@/lib/weather-types";

type ViewMode = "grid" | "list";

export interface ForecastAndHistoryProps {
  forecast: WeatherbitForecastResponse | null;
  history: WeatherbitHistoryResponse | null;
  forecastStatus: string;
  historyStatus: string;
  forecastError: string | null;
  historyError: string | null;
  selectedDay: SelectedDay;
  onSelectDay: (selection: SelectedDay) => void;
  /** When true, render without own card (inside a single block). */
  embedded?: boolean;
}

export function ForecastAndHistory({
  forecast,
  history,
  forecastStatus,
  historyStatus,
  forecastError,
  historyError,
  selectedDay,
  onSelectDay,
  embedded,
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
    const loaderClass = embedded
      ? "w-full border-t border-slate-200/60 p-6 md:p-8"
      : "glass-card w-full animate-fade-in rounded-2xl p-6 md:p-8";
    return (
      <div className={loaderClass}>
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500" />
          <span className="text-sm font-medium text-slate-600">
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

  const sectionClass = embedded
    ? "w-full border-t border-slate-200/60 p-5 sm:p-6 md:p-8"
    : "weather-card glass-card w-full animate-fade-in-up rounded-2xl p-5 sm:p-6 md:p-8";

  return (
    <section
      className={sectionClass}
      aria-label="3-day forecast and 3-day history"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 md:mb-6">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl md:text-2xl">
          Forecast & History
        </h2>
        <div className="flex rounded-xl bg-slate-100/80 p-0.5">
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
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 md:mb-3">
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
                  isSelected={
                    selectedDay?.type === "forecast" &&
                    selectedDay.day.valid_date === day.valid_date
                  }
                  onSelect={() => onSelectDay({ type: "forecast", day })}
                />
              </li>
            ))}
          </ul>
          {forecastError && (
            <p className="mt-1 text-xs text-slate-600">
              {forecastError}
            </p>
          )}
        </div>
      )}

      {historyDays.length > 0 && (
        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                  isSelected={
                    selectedDay?.type === "history" &&
                    selectedDay.day.datetime === day.datetime
                  }
                  onSelect={() => onSelectDay({ type: "history", day })}
                />
              </li>
            ))}
          </ul>
          {historyError && (
            <p className="mt-1 text-xs text-slate-600">
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
        : "text-slate-600 hover:bg-slate-200/80"
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
  isSelected,
  onSelect,
}: {
  day: WeatherbitForecastDay;
  variant: ViewMode;
  timezone: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const iconUrl = weatherIconUrl(day.weather.icon);
  const label = formatDayLabel(
    day.valid_date ?? day.datetime,
    timezone
  );

  const baseClass =
    "rounded-xl bg-slate-100/80 p-3.5 transition hover:bg-slate-200/80 md:p-4 cursor-pointer select-none text-left w-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";
  const selectedClass = isSelected
    ? "ring-2 ring-sky-500 ring-offset-2 bg-sky-50"
    : "";

  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`${baseClass} ${selectedClass}`}
        aria-pressed={isSelected}
        aria-label={`View weather for ${label}`}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center">
          <div className="flex items-center gap-2.5 min-w-0">
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
              <p className="font-semibold text-slate-800">{label}</p>
              <p className="truncate text-xs text-slate-500">{day.weather.description}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <span className="font-bold text-slate-800">
              {Math.round(day.high_temp)}° / {Math.round(day.low_temp)}°
            </span>
            <span className="ml-1.5 text-slate-500">{(day.precip ?? 0).toFixed(2)} mm</span>
          </div>
          {(day.wind_spd > 0 || day.rh > 0) && (
            <p className="col-span-2 text-xs text-slate-500">
              Wind {day.wind_spd} m/s · {day.rh}% humidity
            </p>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${baseClass} ${selectedClass}`}
      aria-pressed={isSelected}
      aria-label={`View weather for ${label}`}
    >
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
          <p className="font-semibold text-slate-800">{label}</p>
          <p className="truncate text-xs text-slate-500">{day.weather.description}</p>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-sm">
        <span className="font-bold text-slate-800">
          {Math.round(day.high_temp)}° / {Math.round(day.low_temp)}°
        </span>
        <span className="text-slate-500">{(day.precip ?? 0).toFixed(2)} mm</span>
      </div>
      {(day.wind_spd > 0 || day.rh > 0) && (
        <p className="mt-1 text-xs text-slate-500">
          Wind {day.wind_spd} m/s · {day.rh}% humidity
        </p>
      )}
    </button>
  );
}

function HistoryDayCard({
  day,
  variant,
  timezone,
  isSelected,
  onSelect,
}: {
  day: WeatherbitHistoryDay;
  variant: ViewMode;
  timezone: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const label = formatDayLabel(day.datetime, timezone);

  const baseClass =
    "rounded-xl bg-slate-100/80 p-3.5 transition hover:bg-slate-200/80 md:p-4 cursor-pointer select-none text-left w-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";
  const selectedClass = isSelected
    ? "ring-2 ring-sky-500 ring-offset-2 bg-sky-50"
    : "";

  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`${baseClass} ${selectedClass}`}
        aria-pressed={isSelected}
        aria-label={`View weather for ${label}`}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 items-center">
          <p className="font-semibold text-slate-800">{label}</p>
          <div className="text-right text-sm font-medium text-slate-600">
            {Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°
          </div>
          <p className="col-span-2 text-xs text-slate-500">
            Precip {(day.precip ?? 0).toFixed(2)} mm
            {day.wind_spd != null && day.wind_spd > 0 && ` · Wind ${day.wind_spd} m/s`}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${baseClass} ${selectedClass}`}
      aria-pressed={isSelected}
      aria-label={`View weather for ${label}`}
    >
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-600">
        {Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°
      </p>
      <p className="text-xs text-slate-500">Precip {(day.precip ?? 0).toFixed(2)} mm</p>
      {day.wind_spd != null && day.wind_spd > 0 && (
        <p className="text-xs text-slate-500">Wind {day.wind_spd} m/s</p>
      )}
    </button>
  );
}
