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
} from "@/components/ui";
import { createItem, deleteItem, updateItem, useResource } from "@/hooks/use-resource";
import { relativeDueLabel, titleCase } from "@/lib/format";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Project,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type TeamMember,
} from "@/lib/types";

const EMPTY: Partial<Task> = {
  title: "",
  project_id: null,
  assignee_id: null,
  status: "todo",
  priority: "medium",
  due_date: "",
};

const COLUMN_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TasksPage() {
  const { data, loading, error, refresh } = useResource<Task>("/api/tasks");
  const { data: projects } = useResource<Project>("/api/projects");
  const { data: team } = useResource<TeamMember>("/api/team");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<Task>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError(null);
    setOpen(true);
  }
  function openEdit(t: Task) {
    setEditing(t);
    setForm(t);
    setFormError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.title?.trim()) return setFormError("Task title is required.");
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await updateItem("/api/tasks", editing.id, form);
      else await createItem("/api/tasks", form);
      setOpen(false);
      await refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function move(t: Task, status: TaskStatus) {
    await updateItem("/api/tasks", t.id, { status });
    await refresh();
  }
  async function remove(t: Task) {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    await deleteItem("/api/tasks", t.id);
    await refresh();
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tasks"
        subtitle="Team workload across all projects"
        action={
          <Button onClick={openCreate}>
            <PlusIcon /> Add Task
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((status) => {
            const tasks = data.filter((t) => t.status === status);
            return (
              <div key={status} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-slate-700">{COLUMN_LABEL[status]}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {tasks.map((t) => {
                    const due = relativeDueLabel(t.due_date);
                    return (
                      <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900">{t.title}</p>
                          <Badge status={t.priority} />
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {t.project_name ?? "No project"}
                          {t.assignee_name ? ` · ${t.assignee_name}` : ""}
                        </p>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
                          <span
                            className={`text-xs font-medium ${
                              due.tone === "overdue"
                                ? "text-red-600"
                                : due.tone === "soon"
                                  ? "text-amber-600"
                                  : "text-slate-400"
                            }`}
                          >
                            {due.label}
                          </span>
                          <div className="flex items-center gap-1">
                            {status !== "todo" && (
                              <button
                                title="Move left"
                                onClick={() =>
                                  move(t, status === "done" ? "in_progress" : "todo")
                                }
                                className="rounded px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                ←
                              </button>
                            )}
                            {status !== "done" && (
                              <button
                                title="Move right"
                                onClick={() =>
                                  move(t, status === "todo" ? "in_progress" : "done")
                                }
                                className="rounded px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                →
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(t)}
                              className="rounded px-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(t)}
                              className="rounded px-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && <p className="px-1 py-3 text-xs text-slate-400">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Task" : "Add Task"}
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
            <Field label="Project">
              <Select
                value={form.project_id ?? ""}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assignee">
              <Select
                value={form.assignee_id ?? ""}
                onChange={(e) =>
                  setForm({ ...form, assignee_id: e.target.value ? Number(e.target.value) : null })
                }
              >
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status ?? "todo"}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={form.priority ?? "medium"}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                {TASK_PRIORITIES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Due date">
            <Input
              type="date"
              value={form.due_date ?? ""}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
