"use client";

import { useCallback, useState } from "react";

export interface SearchBarProps {
  onSearch: (city: string) => void;
  onUseLocation?: () => void;
  onClearRecents?: () => void;
  isLoading?: boolean;
  recentQueries?: string[];
}

/** Parse input to city name (South Africa only; any text after a comma is ignored). */
function parseCity(input: string): string {
  const trimmed = input.trim();
  const comma = trimmed.indexOf(",");
  return comma === -1 ? trimmed : trimmed.slice(0, comma).trim();
}

export function SearchBar({
  onSearch,
  onUseLocation,
  onClearRecents,
  isLoading = false,
  recentQueries = [],
}: SearchBarProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const city = parseCity(value);
      if (city) onSearch(city);
    },
    [value, onSearch]
  );

  const handleRecentClick = useCallback(
    (query: string) => {
      const city = parseCity(query);
      if (city) onSearch(city);
      setValue(query);
    },
    [onSearch]
  );

  return (
    <div className="w-full max-w-md animate-fade-in">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="weather-search" className="sr-only">
          South African city
        </label>
        <input
          id="weather-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. Cape Town, Johannesburg"
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
        Search by South African city.
      </p>
      {recentQueries.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
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
          {onClearRecents && (
            <button
              type="button"
              onClick={onClearRecents}
              className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
