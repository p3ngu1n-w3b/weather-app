"use client";

import { useCallback, useState } from "react";
import type { WeatherbitCurrentResponse } from "@/lib/weather-types";
import { getCachedWeather, setCachedWeather } from "@/lib/weather-cache";

export type WeatherStatus = "idle" | "loading" | "success" | "error";

export interface UseWeatherResult {
  data: WeatherbitCurrentResponse | null;
  status: WeatherStatus;
  error: string | null;
  fetchWeather: (city: string, country?: string) => Promise<void>;
  fetchByCoords: (lat: number, lon: number) => Promise<void>;
}

function normalizeQuery(city: string, country?: string): string {
  const c = city.trim();
  const co = country?.trim();
  return co ? `${c}, ${co}` : c;
}

export function useWeather(): UseWeatherResult {
  const [data, setData] = useState<WeatherbitCurrentResponse | null>(null);
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (city: string, country?: string) => {
    const query = normalizeQuery(city, country);
    if (!query) return;

    const cached = getCachedWeather(query);
    if (cached) {
      setData(cached.response);
      setStatus("success");
      setError(null);
    }

    setStatus("loading");
    setError(null);

    const params = new URLSearchParams({ city: city.trim() });
    if (country?.trim()) params.set("country", country.trim());

    try {
      const res = await fetch(`/api/weather?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setStatus("error");
        setError(json.error ?? "Failed to load weather.");
        return;
      }

      const response = json as WeatherbitCurrentResponse;
      setData(response);
      setStatus("success");
      setError(null);
      setCachedWeather(query, response);
    } catch (e) {
      setData(null);
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to fetch weather.");
    }
  }, []);

  const fetchByCoords = useCallback(async (lat: number, lon: number) => {
    const query = `${lat},${lon}`;
    const cached = getCachedWeather(query);
    if (cached) {
      setData(cached.response);
      setStatus("success");
      setError(null);
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch(
        `/api/weather?${new URLSearchParams({ lat: String(lat), lon: String(lon) })}`
      );
      const json = await res.json();

      if (!res.ok) {
        setData(null);
        setStatus("error");
        setError(json.error ?? "Failed to load weather.");
        return;
      }

      const response = json as WeatherbitCurrentResponse;
      setData(response);
      setStatus("success");
      setError(null);
      setCachedWeather(query, response);
    } catch (e) {
      setData(null);
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to fetch weather.");
    }
  }, []);

  return { data, status, error, fetchWeather, fetchByCoords };
}
