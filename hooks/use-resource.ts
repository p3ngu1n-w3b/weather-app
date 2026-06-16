"use client";

import { useCallback, useEffect, useState } from "react";

export function useResource<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setData((await res.json()) as T[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, setData };
}

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export function createItem<T>(url: string, body: unknown) {
  return send<T>(url, "POST", body);
}
export function updateItem<T>(url: string, id: number | string, body: unknown) {
  return send<T>(`${url}/${id}`, "PATCH", body);
}
export function deleteItem(url: string, id: number | string) {
  return send<{ success: boolean }>(`${url}/${id}`, "DELETE");
}
export function postAction<T>(url: string) {
  return send<T>(url, "POST");
}
