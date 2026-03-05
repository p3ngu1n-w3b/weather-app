"use client";

import { useCallback, useState } from "react";

export interface SearchBarProps {
  onSearch: (city: string) => void;
  onUseLocation?: () => void;
  onClearRecents?: () => void;
  isLoading?: boolean;
  recentQueries?: string[];
  /** Current location to show in the search bar when input is empty */
  currentLocation?: string | null;
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
  currentLocation = null,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const searchPlaceholder = value.trim()
    ? "e.g. Cape Town, Johannesburg"
    : (currentLocation || "e.g. Cape Town, Johannesburg");

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
    <div className="w-full animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2"
      >
        {onUseLocation && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={isLoading}
            className="order-first flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white/80 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-sky-500/10 dark:hover:text-sky-300 sm:order-none sm:px-4"
            title="Use current location"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Location</span>
          </button>
        )}
        <label htmlFor="weather-search" className="sr-only">
          South African city
        </label>
        <input
          id="weather-search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={searchPlaceholder}
          disabled={isLoading}
          className="glass-card min-h-12 min-w-0 flex-1 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:ring-sky-400/40"
          aria-describedby="search-hint"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="min-h-12 shrink-0 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-100 disabled:opacity-40 dark:bg-sky-500 dark:shadow-sky-500/20 dark:hover:bg-sky-400 dark:focus:ring-offset-slate-900 sm:px-5"
        >
          {isLoading ? "…" : "Search"}
        </button>
      </form>
      <p id="search-hint" className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
        Search by South African city.
      </p>
      {recentQueries.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Recent</span>
          {recentQueries.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleRecentClick(q)}
              className="min-h-8 rounded-full bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white/80 hover:shadow active:scale-[0.98] dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-600/60"
            >
              {q}
            </button>
          ))}
          {onClearRecents && (
            <button
              type="button"
              onClick={onClearRecents}
              className="min-h-8 text-xs text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
