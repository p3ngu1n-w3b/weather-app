"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Field,
  Input,
  Modal,
  PageHeader,
  PlusIcon,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import {
  createItem,
  deleteItem,
  postAction,
  updateItem,
  useResource,
} from "@/hooks/use-resource";
import { formatCurrency, titleCase } from "@/lib/format";
import { LEAD_SOURCES, LEAD_STAGES, SERVICE_TYPES, type Lead, type LeadStage } from "@/lib/types";

const EMPTY: Partial<Lead> = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website",
  service_interest: SERVICE_TYPES[0],
  stage: "new",
  value: 0,
  notes: "",
};

export default function LeadsPage() {
  const { data, loading, error, refresh } = useResource<Lead>("/api/leads");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(lead: Lead) {
    setEditing(lead);
    setForm(lead);
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name?.trim()) {
      setFormError("Contact name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/leads", editing.id, form);
      else await createItem("/api/leads", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(lead: Lead) {
    if (!confirm(`Delete lead ${lead.company || lead.name}?`)) return;
    await deleteItem("/api/leads", lead.id);
    await refresh();
  }

  async function convert(lead: Lead) {
    if (!confirm(`Convert ${lead.company || lead.name} into an active client?`)) return;
    await postAction(`/api/leads/${lead.id}/convert`);
    await refresh();
    alert("Lead converted to client.");
  }

  const totalPipeline = data
    .filter((l) => ["new", "contacted", "proposal"].includes(l.stage))
    .reduce((s, l) => s + l.value, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leads"
        subtitle={`Sales pipeline · ${formatCurrency(totalPipeline)} open value`}
        action={
          <Button onClick={openCreate}>
            <PlusIcon /> Add Lead
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {LEAD_STAGES.map((stage) => {
            const leads = data.filter((l) => l.stage === stage);
            const sum = leads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Badge status={stage} /> {leads.length}
                  </span>
                  <span className="text-xs text-slate-400">{formatCurrency(sum)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-slate-900">{l.company || l.name}</p>
                      <p className="text-xs text-slate-400">{l.name}</p>
                      <p className="mt-1.5 text-xs text-slate-500">{l.service_interest}</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{formatCurrency(l.value)}</p>
                      <div className="mt-2 flex flex-wrap gap-1 border-t border-slate-50 pt-2">
                        <button
                          onClick={() => openEdit(l)}
                          className="rounded px-1.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        {l.stage !== "lost" && (
                          <button
                            onClick={() => convert(l)}
                            className="rounded px-1.5 py-0.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => remove(l)}
                          className="rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="px-1 py-3 text-xs text-slate-400">No leads</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Lead" : "Add Lead"}
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
            <Field label="Contact name">
              <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Company">
              <Input
                value={form.company ?? ""}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
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
            <Field label="Source">
              <Select value={form.source ?? "Website"} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service interest">
              <Select
                value={form.service_interest ?? SERVICE_TYPES[0]}
                onChange={(e) => setForm({ ...form, service_interest: e.target.value })}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estimated value (R)">
              <Input
                type="number"
                value={form.value ?? 0}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </Field>
            <Field label="Stage">
              <Select
                value={form.stage ?? "new"}
                onChange={(e) => setForm({ ...form, stage: e.target.value as LeadStage })}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
