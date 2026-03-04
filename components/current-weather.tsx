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

  return (
    <article
      className="animate-fade-in-up rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg duration-500 md:p-8"
      aria-label={`Current weather in ${location}`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
            <Image
              src={iconUrl}
              alt={weather.description}
              width={96}
              height={96}
              unoptimized
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 md:text-3xl">
              {location}
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">{weather.description}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {formatCurrentWeatherDate(datetime, timezone)}
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-2 border-zinc-200 sm:border-l sm:pl-6 dark:border-zinc-600">
          <span className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100 md:text-5xl">
            {Math.round(temp)}°C
          </span>
          {app_temp !== temp && (
            <span className="text-lg text-zinc-500 dark:text-zinc-400">
              Feels like {Math.round(app_temp)}°C
            </span>
          )}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 md:gap-4">
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
    <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-700/50">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
