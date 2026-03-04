"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  WeatherbitForecastResponse,
  WeatherbitHistoryResponse,
} from "@/lib/weather-types";
import { SA_TIMEZONE } from "@/lib/constants";

export type ForecastHistoryStatus = "idle" | "loading" | "success" | "error";

export interface UseForecastHistoryResult {
  forecast: WeatherbitForecastResponse | null;
  history: WeatherbitHistoryResponse | null;
  forecastStatus: ForecastHistoryStatus;
  historyStatus: ForecastHistoryStatus;
  forecastError: string | null;
  historyError: string | null;
}

interface Coords {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export function useForecastAndHistory(
  coords: Coords | null
): UseForecastHistoryResult {
  const [forecast, setForecast] = useState<WeatherbitForecastResponse | null>(
    null
  );
  const [history, setHistory] = useState<WeatherbitHistoryResponse | null>(
    null
  );
  const [forecastStatus, setForecastStatus] =
    useState<ForecastHistoryStatus>("idle");
  const [historyStatus, setHistoryStatus] =
    useState<ForecastHistoryStatus>("idle");
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchBoth = useCallback(async (c: Coords) => {
    const latLonParams = new URLSearchParams({
      lat: String(c.lat),
      lon: String(c.lon),
      timezone: c.timezone ?? SA_TIMEZONE,
    });
    const latLon = latLonParams.toString();
    const cityParams =
      c.city != null && c.city.trim() !== ""
        ? new URLSearchParams({
            city: c.city.trim(),
            ...(c.country?.trim() && { country: c.country.trim() }),
          }).toString()
        : latLon;

    setForecastStatus("loading");
    setHistoryStatus("loading");
    setForecastError(null);
    setHistoryError(null);

    const [forecastRes, historyRes] = await Promise.all([
      fetch(`/api/weather/forecast?${cityParams}`),
      fetch(`/api/weather/history?${latLon}`),
    ]);

    const forecastJson = await forecastRes.json();
    const historyJson = await historyRes.json();

    if (forecastRes.ok) {
      setForecast(forecastJson as WeatherbitForecastResponse);
      setForecastStatus("success");
    } else {
      setForecast(null);
      setForecastStatus("error");
      setForecastError(forecastJson.error ?? "Failed to load forecast.");
    }

    if (historyRes.ok) {
      setHistory(historyJson as WeatherbitHistoryResponse);
      setHistoryStatus("success");
    } else {
      setHistory(null);
      setHistoryStatus("error");
      setHistoryError(historyJson.error ?? "Failed to load history.");
    }
  }, []);

  useEffect(() => {
    if (coords == null) {
      setForecast(null);
      setHistory(null);
      setForecastStatus("idle");
      setHistoryStatus("idle");
      setForecastError(null);
      setHistoryError(null);
      return;
    }
    fetchBoth(coords);
  }, [coords?.lat, coords?.lon, coords?.city, coords?.country, coords?.timezone, fetchBoth]);

  return {
    forecast,
    history,
    forecastStatus,
    historyStatus,
    forecastError,
    historyError,
  };
}
