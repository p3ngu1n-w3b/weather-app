"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  PlusIcon,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import { createItem, deleteItem, updateItem, useResource } from "@/hooks/use-resource";
import { formatDate, titleCase } from "@/lib/format";
import {
  PLATFORMS,
  POST_STATUSES,
  type Client,
  type ContentPost,
  type PostStatus,
} from "@/lib/types";

const EMPTY: Partial<ContentPost> = {
  client_id: undefined,
  platform: PLATFORMS[0],
  title: "",
  body: "",
  scheduled_date: "",
  status: "draft",
};

const PLATFORM_COLOR: Record<string, string> = {
  Facebook: "bg-blue-100 text-blue-700",
  Instagram: "bg-pink-100 text-pink-700",
  LinkedIn: "bg-sky-100 text-sky-700",
  X: "bg-slate-200 text-slate-700",
  TikTok: "bg-slate-800 text-white",
  YouTube: "bg-red-100 text-red-700",
};

export default function ContentPage() {
  const { data, loading, error, refresh } = useResource<ContentPost>("/api/content");
  const { data: clients } = useResource<Client>("/api/clients");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContentPost | null>(null);
  const [form, setForm] = useState<Partial<ContentPost>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, ContentPost[]>();
    for (const post of data) {
      const key = post.scheduled_date || "Unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    }
    return Array.from(map.entries());
  }, [data]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, client_id: clients[0]?.id });
    setFormError(null);
    setOpen(true);
  }
  function openEdit(p: ContentPost) {
    setEditing(p);
    setForm(p);
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.title?.trim()) return setFormError("Post title is required.");
    if (!form.client_id) return setFormError("Please select a client.");
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/content", editing.id, form);
      else await createItem("/api/content", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(p: ContentPost) {
    if (!confirm(`Delete post "${p.title}"?`)) return;
    await deleteItem("/api/content", p.id);
    await refresh();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Content Calendar"
        subtitle="Plan and schedule social media posts"
        action={
          <Button onClick={openCreate} disabled={clients.length === 0}>
            <PlusIcon /> Schedule Post
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data.length === 0 ? (
        <EmptyState title="No posts scheduled" hint="Schedule your first social post." />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([date, posts]) => (
            <div key={date}>
              <p className="mb-2 text-sm font-semibold text-slate-500">
                {date === "Unscheduled" ? "Unscheduled" : formatDate(date)}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          PLATFORM_COLOR[p.platform] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.platform}
                      </span>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{p.client_name}</p>
                    <div className="mt-2 flex gap-1 border-t border-slate-50 pt-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded px-1.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Post" : "Schedule Post"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <Field label="Title">
            <Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client">
              <Select
                value={form.client_id ?? ""}
                onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
              >
                <option value="" disabled>
                  Select client…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Platform">
              <Select
                value={form.platform ?? PLATFORMS[0]}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Scheduled date">
              <Input
                type="date"
                value={form.scheduled_date ?? ""}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status ?? "draft"}
                onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
              >
                {POST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Caption / body">
            <Textarea value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
