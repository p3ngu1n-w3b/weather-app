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
} from "@/components/ui";
import { createItem, deleteItem, updateItem, useResource } from "@/hooks/use-resource";
import { formatCurrency, formatDate, titleCase } from "@/lib/format";
import {
  PROJECT_STATUSES,
  SERVICE_TYPES,
  type Client,
  type Project,
  type ProjectStatus,
} from "@/lib/types";

const EMPTY: Partial<Project> = {
  name: "",
  client_id: undefined,
  service_type: SERVICE_TYPES[0],
  status: "planning",
  budget: 0,
  start_date: "",
  due_date: "",
  description: "",
};

export default function ProjectsPage() {
  const { data, loading, error, refresh } = useResource<Project>("/api/projects");
  const { data: clients } = useResource<Client>("/api/clients");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, client_id: clients[0]?.id });
    setFormError(null);
    setOpen(true);
  }
  function openEdit(p: Project) {
    setEditing(p);
    setForm(p);
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name?.trim()) return setFormError("Project name is required.");
    if (!form.client_id) return setFormError("Please select a client.");
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/projects", editing.id, form);
      else await createItem("/api/projects", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Project) {
    if (!confirm(`Delete project "${p.name}"?`)) return;
    await deleteItem("/api/projects", p.id);
    await refresh();
  }

  const columns: Column<Project>[] = [
    {
      header: "Project",
      cell: (p) => (
        <div>
          <p className="font-medium text-slate-900">{p.name}</p>
          <p className="text-xs text-slate-400">{p.client_name}</p>
        </div>
      ),
    },
    { header: "Service", cell: (p) => <span className="text-slate-600">{p.service_type}</span> },
    { header: "Status", cell: (p) => <Badge status={p.status} /> },
    { header: "Budget", cell: (p) => formatCurrency(p.budget) },
    { header: "Due", cell: (p) => formatDate(p.due_date) },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle="Active and upcoming client work"
        action={
          <Button onClick={openCreate} disabled={clients.length === 0}>
            <PlusIcon /> Add Project
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : data.length === 0 ? (
        <EmptyState title="No projects yet" hint="Create a project for one of your clients." />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          actions={(p) => (
            <>
              <RowAction label="Edit" onClick={() => openEdit(p)} />
              <RowAction label="Delete" danger onClick={() => remove(p)} />
            </>
          )}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Project" : "Add Project"}
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
          <Field label="Project name">
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
            <Field label="Service type">
              <Select
                value={form.service_type ?? SERVICE_TYPES[0]}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status ?? "planning"}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Budget (R)">
              <Input
                type="number"
                value={form.budget ?? 0}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
              />
            </Field>
            <Field label="Start date">
              <Input
                type="date"
                value={form.start_date ?? ""}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
