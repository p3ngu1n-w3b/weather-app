"use client";

import Image from "next/image";
import type { WeatherbitCurrentData } from "@/lib/weather-types";
import { weatherIconUrl, formatCurrentWeatherDate } from "@/lib/weather-utils";

export interface CurrentWeatherProps {
  data: WeatherbitCurrentData;
  /** When set (e.g. from "Use my location" + reverse geocode), shown instead of API city name. */
  locationDisplayName?: string | null;
}

export function CurrentWeather({ data, locationDisplayName }: CurrentWeatherProps) {
  const {
    city_name,
    state_code,
    country_code,
    temp,
    app_temp,
    weather,
    rh,
    wind_spd,
    wind_cdir_full,
    uv,
    vis,
    sunrise,
    sunset,
    datetime,
    timezone,
  } = data;

  const location =
    locationDisplayName?.trim() ||
    [city_name, state_code, country_code].filter(Boolean).join(", ");
  const iconUrl = weatherIconUrl(weather.icon);
  const isSunny = weather.icon?.includes("01") ?? false;

  return (
    <article
      className="weather-card glass-card w-full animate-fade-in-up rounded-2xl overflow-hidden p-5 sm:p-6 md:p-8"
      aria-label={`Current weather in ${location}`}
    >
      <div className="p-5 sm:p-0 sm:pt-1">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`relative h-20 w-20 shrink-0 sm:h-24 sm:w-24 ${isSunny ? "animate-sun-glow" : "animate-float-soft"}`}
            >
              <Image
                src={iconUrl}
                alt={weather.description}
                width={112}
                height={112}
                unoptimized
                className="object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl md:text-[2rem]">
                {location}
              </h2>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">{weather.description}</p>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {formatCurrentWeatherDate(datetime, timezone)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-end sm:border-l sm:border-slate-200/60 sm:pl-6 md:pl-8 dark:sm:border-slate-500/30">
            <span className="text-5xl font-bold tabular-nums text-slate-800 dark:text-slate-100 sm:text-6xl md:text-7xl">
              {Math.round(temp)}°
            </span>
            {app_temp !== temp && (
              <span className="text-base font-medium text-sky-600 dark:text-sky-400">
                Feels like {Math.round(app_temp)}°
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 sm:gap-3 md:gap-4 md:mt-8">
        <DetailItem label="Humidity" value={`${rh}%`} />
        <DetailItem label="Wind" value={`${wind_spd} m/s ${wind_cdir_full}`} />
        <DetailItem label="UV index" value={String(uv)} />
        <DetailItem label="Visibility" value={`${vis} km`} />
        <DetailItem label="Sunrise" value={sunrise} />
        <DetailItem label="Sunset" value={sunset} />
      </dl>
    </article>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-100/80 px-3.5 py-2.5 dark:bg-slate-800/50">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}
