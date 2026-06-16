"use client";

import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  PlusIcon,
  Spinner,
} from "@/components/ui";
import { createItem, deleteItem, updateItem, useResource } from "@/hooks/use-resource";
import { initials } from "@/lib/format";
import type { TeamMember } from "@/lib/types";

const EMPTY: Partial<TeamMember> = { name: "", role: "", email: "", phone: "" };

export default function TeamPage() {
  const { data, loading, error, refresh } = useResource<TeamMember>("/api/team");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<Partial<TeamMember>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(m: TeamMember) {
    setEditing(m);
    setForm(m);
    setFormError(null);
    setOpen(true);
  }
  async function save() {
    if (!form.name?.trim()) return setFormError("Name is required.");
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/team", editing.id, form);
      else await createItem("/api/team", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(m: TeamMember) {
    if (!confirm(`Remove ${m.name} from the team?`)) return;
    await deleteItem("/api/team", m.id);
    await refresh();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Team"
        subtitle="The people behind Creative Touch"
        action={
          <Button onClick={openCreate}>
            <PlusIcon /> Add Member
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data.length === 0 ? (
        <EmptyState title="No team members" hint="Add your first team member." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{m.name}</p>
                  <p className="truncate text-xs text-slate-500">{m.role || "—"}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p className="truncate">{m.email || "—"}</p>
                <p>{m.phone || "—"}</p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-50 pt-3">
                <button
                  onClick={() => openEdit(m)}
                  className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(m)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Member" : "Add Member"}
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
          <Field label="Name">
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={form.role ?? ""} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
