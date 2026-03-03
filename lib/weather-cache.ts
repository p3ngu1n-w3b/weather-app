import type { WeatherbitCurrentResponse } from "./weather-types";

const CACHE_KEY_PREFIX = "weather-app:";
const TTL_MS = 10 * 60 * 1000; // 10 minutes

export interface CachedWeather {
  response: WeatherbitCurrentResponse;
  query: string;
  fetchedAt: number;
}

function cacheKey(query: string): string {
  return `${CACHE_KEY_PREFIX}${query.toLowerCase().trim()}`;
}

export function getCachedWeather(query: string): CachedWeather | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(query));
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

export function setCachedWeather(query: string, response: WeatherbitCurrentResponse): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CachedWeather = {
      response,
      query: query.trim(),
      fetchedAt: Date.now(),
    };
    localStorage.setItem(cacheKey(query), JSON.stringify(entry));
  } catch {
    // ignore storage errors
  }
}

export function getRecentQueries(max = 5): string[] {
  if (typeof window === "undefined") return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const query = key.slice(CACHE_KEY_PREFIX.length);
        if (query) keys.push(query);
      }
    }
    return keys.slice(0, max);
  } catch {
    return [];
  }
}
