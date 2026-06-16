"use client";

import { useMemo, useState } from "react";
import { Column, DataTable, RowAction } from "@/components/data-table";
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
import { CLIENT_STATUSES, type Client } from "@/lib/types";

const EMPTY: Partial<Client> = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  industry: "",
  status: "prospect",
  notes: "",
};

export default function ClientsPage() {
  const { data, loading, error, refresh } = useResource<Client>("/api/clients");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
    );
  }, [data, query]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(client: Client) {
    setEditing(client);
    setForm(client);
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name?.trim()) {
      setFormError("Client name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/clients", editing.id, form);
      else await createItem("/api/clients", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(client: Client) {
    if (!confirm(`Delete ${client.name}? This also removes their projects and invoices.`)) return;
    await deleteItem("/api/clients", client.id);
    await refresh();
  }

  const columns: Column<Client>[] = [
    {
      header: "Client",
      cell: (c) => (
        <div>
          <p className="font-medium text-slate-900">{c.name}</p>
          <p className="text-xs text-slate-400">{c.industry || "—"}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (c) => (
        <div>
          <p className="text-slate-700">{c.contact_name || "—"}</p>
          <p className="text-xs text-slate-400">{c.email}</p>
        </div>
      ),
    },
    { header: "Phone", cell: (c) => c.phone || "—" },
    { header: "Status", cell: (c) => <Badge status={c.status} /> },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Clients"
        subtitle="Your agency's client relationships"
        action={
          <Button onClick={openCreate}>
            <PlusIcon /> Add Client
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Search clients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No clients found" hint="Add your first client to get started." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          actions={(c) => (
            <>
              <RowAction label="Edit" onClick={() => openEdit(c)} />
              <RowAction label="Delete" danger onClick={() => remove(c)} />
            </>
          )}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Client" : "Add Client"}
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
          <Field label="Company name">
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact person">
              <Input
                value={form.contact_name ?? ""}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              />
            </Field>
            <Field label="Industry">
              <Input
                value={form.industry ?? ""}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </Field>
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
          <Field label="Status">
            <Select
              value={form.status ?? "prospect"}
              onChange={(e) => setForm({ ...form, status: e.target.value as Client["status"] })}
            >
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
