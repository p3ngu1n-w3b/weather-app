"use client";

import { useCallback, useState } from "react";

export interface SearchBarProps {
  onSearch: (city: string, country?: string) => void;
  onUseLocation?: () => void;
  isLoading?: boolean;
  recentQueries?: string[];
}

/**
 * Parses "City, Country" or "City, ST" into [city, country].
 */
function parseQuery(input: string): { city: string; country?: string } {
  const trimmed = input.trim();
  const comma = trimmed.indexOf(",");
  if (comma === -1) return { city: trimmed };
  const city = trimmed.slice(0, comma).trim();
  const country = trimmed.slice(comma + 1).trim();
  return { city, country: country || undefined };
}

export function SearchBar({
  onSearch,
  onUseLocation,
  isLoading = false,
  recentQueries = [],
}: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const { city, country } = parseQuery(value);
      if (city) onSearch(city, country);
    },
    [value, onSearch]
  );

  const handleRecentClick = useCallback(
    (query: string) => {
      const { city, country } = parseQuery(query);
      if (city) onSearch(city, country);
      setValue(query);
    },
    [onSearch]
  );

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="weather-search" className="sr-only">
          City or location
        </label>
        <input
          id="weather-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. London, UK or New York"
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400"
          aria-describedby="search-hint"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white shadow transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
        >
          {isLoading ? "Loading…" : "Search"}
        </button>
      </form>
      {onUseLocation && (
        <button
          type="button"
          onClick={onUseLocation}
          disabled={isLoading}
          className="mt-2 text-sm text-sky-600 hover:underline disabled:opacity-50 dark:text-sky-400"
        >
          Use my location
        </button>
      )}
      <p id="search-hint" className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Enter a city name; add a country code (e.g. UK, US) if needed.
      </p>
      {recentQueries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Recent:</span>
          {recentQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleRecentClick(q)}
              className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
