"use client";

import Image from "next/image";
import type {
  WeatherbitForecastDay,
  WeatherbitHistoryDay,
} from "@/lib/weather-types";
import {
  weatherIconUrl,
  formatDayLabel,
} from "@/lib/weather-utils";

type DayDetailViewProps =
  | {
      type: "forecast";
      day: WeatherbitForecastDay;
      timezone: string;
      locationName: string;
    }
  | {
      type: "history";
      day: WeatherbitHistoryDay;
      timezone: string;
      locationName: string;
    };

const embeddedArticleClass = "w-full overflow-hidden p-5 sm:p-6 md:p-8";
const standaloneArticleClass = "weather-card glass-card w-full animate-fade-in-up rounded-2xl overflow-hidden p-5 sm:p-6 md:p-8";

export function DayDetailView(
  props: DayDetailViewProps & { onBackToCurrent?: () => void; embedded?: boolean }
) {
  const { timezone, locationName, onBackToCurrent, embedded } = props;
  const articleClass = embedded ? embeddedArticleClass : standaloneArticleClass;
  const label = formatDayLabel(
    props.type === "forecast" ? props.day.valid_date ?? props.day.datetime : props.day.datetime,
    timezone
  );

  if (props.type === "forecast") {
    const { day } = props;
    const iconUrl = weatherIconUrl(day.weather.icon);
    return (
      <article
        className={articleClass}
        aria-label={`Weather for ${label} in ${locationName}`}
      >
        {onBackToCurrent && (
          <button
            type="button"
            onClick={onBackToCurrent}
            className="mb-3 text-xs font-medium text-sky-600 hover:underline"
          >
            ← Back to current weather
          </button>
        )}
        <div className="p-5 sm:p-0 sm:pt-1">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24 animate-float-soft">
                <Image
                  src={iconUrl}
                  alt={day.weather.description}
                  width={112}
                  height={112}
                  unoptimized
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl md:text-[2rem]">
                  {locationName}
                </h2>
                <p className="mt-0.5 text-slate-600">
                  {day.weather.description}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {label}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 sm:items-end sm:border-l sm:border-slate-200/60 sm:pl-6 md:pl-8">
              <span className="text-5xl font-bold tabular-nums text-slate-800 sm:text-6xl md:text-7xl">
                {Math.round(day.high_temp)}° / {Math.round(day.low_temp)}°
              </span>
              <span className="text-base font-medium text-sky-600">
                High / Low
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3 md:gap-4 md:mt-8">
          <DetailItem label="Humidity" value={`${day.rh}%`} />
          <DetailItem label="Wind" value={`${day.wind_spd} m/s ${day.wind_cdir_full ?? ""}`.trim()} />
          {day.uv != null && <DetailItem label="UV index" value={String(day.uv)} />}
          <DetailItem label="Precipitation" value={`${(day.precip ?? 0).toFixed(2)} mm`} />
          {day.pop > 0 && (
            <DetailItem label="Chance of rain" value={`${Math.round(day.pop)}%`} />
          )}
        </dl>
      </article>
    );
  }

  const { day } = props;
  return (
    <article
      className={articleClass}
      aria-label={`Weather for ${label} in ${locationName}`}
    >
      {onBackToCurrent && (
        <button
          type="button"
          onClick={onBackToCurrent}
          className="mb-3 text-xs font-medium text-sky-600 hover:underline"
        >
          ← Back to current weather
        </button>
      )}
      <div className="p-5 sm:p-0 sm:pt-1">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl md:text-[2rem]">
              {locationName}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              {label} (past day)
            </p>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-end sm:border-l sm:border-slate-200/60 sm:pl-6 md:pl-8">
            <span className="text-5xl font-bold tabular-nums text-slate-800 sm:text-6xl md:text-7xl">
              {Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°
            </span>
            <span className="text-base font-medium text-sky-600">
              High / Low
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3 md:gap-4 md:mt-8">
        {day.rh != null && <DetailItem label="Humidity" value={`${day.rh}%`} />}
        {day.wind_spd != null && day.wind_spd > 0 && (
          <DetailItem label="Wind" value={`${day.wind_spd} m/s`} />
        )}
        <DetailItem label="Precipitation" value={`${(day.precip ?? 0).toFixed(2)} mm`} />
      </dl>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100/80 px-3.5 py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  );
}
