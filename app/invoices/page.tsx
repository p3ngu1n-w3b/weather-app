"use client";

import { useState } from "react";
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
  cn,
} from "@/components/ui";
import { createItem, deleteItem, updateItem, useResource } from "@/hooks/use-resource";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import {
  INVOICE_STATUSES,
  type Client,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
  type Project,
} from "@/lib/types";

function emptyInvoice(): Partial<Invoice> {
  return {
    number: "",
    client_id: undefined,
    project_id: null,
    status: "draft",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    notes: "",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  };
}

export default function InvoicesPage() {
  const { data, loading, error, refresh } = useResource<Invoice>("/api/invoices");
  const { data: clients } = useResource<Client>("/api/clients");
  const { data: projects } = useResource<Project>("/api/projects");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>(emptyInvoice());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const items = form.items ?? [];
  const total = items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyInvoice(), client_id: clients[0]?.id });
    setFormError(null);
    setOpen(true);
  }
  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm({ ...inv, items: inv.items.length ? inv.items : [{ description: "", quantity: 1, unit_price: 0 }] });
    setFormError(null);
    setOpen(true);
  }

  function setItem(idx: number, patch: Partial<InvoiceItem>) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    setForm({ ...form, items: next });
  }
  function addItem() {
    setForm({ ...form, items: [...items, { description: "", quantity: 1, unit_price: 0 }] });
  }
  function removeItem(idx: number) {
    setForm({ ...form, items: items.filter((_, i) => i !== idx) });
  }

  async function save() {
    if (!form.client_id) return setFormError("Please select a client.");
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/invoices", editing.id, form);
      else await createItem("/api/invoices", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(inv: Invoice) {
    if (!confirm(`Delete invoice ${inv.number}?`)) return;
    await deleteItem("/api/invoices", inv.id);
    await refresh();
  }

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice",
      cell: (i) => (
        <div>
          <p className="font-medium text-slate-900">{i.number}</p>
          <p className="text-xs text-slate-400">{i.client_name}</p>
        </div>
      ),
    },
    { header: "Issued", cell: (i) => formatDate(i.issue_date) },
    { header: "Due", cell: (i) => formatDate(i.due_date) },
    { header: "Status", cell: (i) => <Badge status={i.status} /> },
    {
      header: "Total",
      className: "text-right",
      cell: (i) => <span className="font-semibold text-slate-900">{formatCurrency(i.total ?? 0)}</span>,
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Invoices"
        subtitle="Billing and payment tracking"
        action={
          <Button onClick={openCreate} disabled={clients.length === 0}>
            <PlusIcon /> New Invoice
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data.length === 0 ? (
        <EmptyState title="No invoices yet" hint="Create your first invoice." />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          actions={(i) => (
            <>
              <RowAction label="Edit" onClick={() => openEdit(i)} />
              <RowAction label="Delete" danger onClick={() => remove(i)} />
            </>
          )}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.number}` : "New Invoice"}
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
            <Field label="Project (optional)">
              <Select
                value={form.project_id ?? ""}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">None</option>
                {projects
                  .filter((p) => !form.client_id || p.client_id === form.client_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Issue date">
              <Input
                type="date"
                value={form.issue_date ?? ""}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              />
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status ?? "draft"}
                onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            {editing && (
              <Field label="Invoice number">
                <Input value={form.number ?? ""} onChange={(e) => setForm({ ...form, number: e.target.value })} />
              </Field>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Line items</span>
              <button
                onClick={addItem}
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                + Add item
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-6"
                    placeholder="Description"
                    value={it.description}
                    onChange={(e) => setItem(idx, { description: e.target.value })}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    placeholder="Unit price"
                    value={it.unit_price}
                    onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })}
                  />
                  <button
                    onClick={() => removeItem(idx)}
                    className={cn(
                      "col-span-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600",
                      items.length === 1 && "pointer-events-none opacity-30"
                    )}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500">Total:&nbsp;</span>
              <span className="text-sm font-bold text-slate-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <Field label="Notes">
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
