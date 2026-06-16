import { getDb } from "@/lib/db";
import type {
  Client,
  ContentPost,
  Invoice,
  InvoiceItem,
  Lead,
  Project,
  Task,
  TeamMember,
} from "@/lib/types";

// ---------- Clients ----------
export function listClients(): Client[] {
  return getDb().prepare("SELECT * FROM clients ORDER BY name COLLATE NOCASE").all() as Client[];
}
export function getClient(id: number): Client | undefined {
  return getDb().prepare("SELECT * FROM clients WHERE id = ?").get(id) as Client | undefined;
}
export function createClient(d: Partial<Client>): Client {
  const info = getDb()
    .prepare(
      "INSERT INTO clients (name, contact_name, email, phone, industry, status, notes) VALUES (@name, @contact_name, @email, @phone, @industry, @status, @notes)"
    )
    .run({
      name: d.name ?? "",
      contact_name: d.contact_name ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      industry: d.industry ?? "",
      status: d.status ?? "prospect",
      notes: d.notes ?? "",
    });
  return getClient(Number(info.lastInsertRowid))!;
}
export function updateClient(id: number, d: Partial<Client>): Client | undefined {
  const cur = getClient(id);
  if (!cur) return undefined;
  getDb()
    .prepare(
      "UPDATE clients SET name=@name, contact_name=@contact_name, email=@email, phone=@phone, industry=@industry, status=@status, notes=@notes WHERE id=@id"
    )
    .run({ ...cur, ...d, id });
  return getClient(id);
}
export function deleteClient(id: number): boolean {
  return getDb().prepare("DELETE FROM clients WHERE id = ?").run(id).changes > 0;
}

// ---------- Leads ----------
export function listLeads(): Lead[] {
  return getDb().prepare("SELECT * FROM leads ORDER BY created_at DESC").all() as Lead[];
}
export function getLead(id: number): Lead | undefined {
  return getDb().prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead | undefined;
}
export function createLead(d: Partial<Lead>): Lead {
  const info = getDb()
    .prepare(
      "INSERT INTO leads (name, company, email, phone, source, service_interest, stage, value, notes) VALUES (@name, @company, @email, @phone, @source, @service_interest, @stage, @value, @notes)"
    )
    .run({
      name: d.name ?? "",
      company: d.company ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      source: d.source ?? "Website",
      service_interest: d.service_interest ?? "",
      stage: d.stage ?? "new",
      value: Number(d.value ?? 0),
      notes: d.notes ?? "",
    });
  return getLead(Number(info.lastInsertRowid))!;
}
export function updateLead(id: number, d: Partial<Lead>): Lead | undefined {
  const cur = getLead(id);
  if (!cur) return undefined;
  getDb()
    .prepare(
      "UPDATE leads SET name=@name, company=@company, email=@email, phone=@phone, source=@source, service_interest=@service_interest, stage=@stage, value=@value, notes=@notes WHERE id=@id"
    )
    .run({ ...cur, ...d, value: Number(d.value ?? cur.value), id });
  return getLead(id);
}
export function deleteLead(id: number): boolean {
  return getDb().prepare("DELETE FROM leads WHERE id = ?").run(id).changes > 0;
}

// Convert a won lead into a client
export function convertLeadToClient(id: number): Client | undefined {
  const lead = getLead(id);
  if (!lead) return undefined;
  const client = createClient({
    name: lead.company || lead.name,
    contact_name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: "active",
    notes: `Converted from lead. Interest: ${lead.service_interest}`,
  });
  updateLead(id, { stage: "won" });
  return client;
}

// ---------- Projects ----------
const PROJECT_SELECT =
  "SELECT p.*, c.name AS client_name FROM projects p LEFT JOIN clients c ON c.id = p.client_id";
export function listProjects(): Project[] {
  return getDb().prepare(`${PROJECT_SELECT} ORDER BY p.created_at DESC`).all() as Project[];
}
export function getProject(id: number): Project | undefined {
  return getDb().prepare(`${PROJECT_SELECT} WHERE p.id = ?`).get(id) as Project | undefined;
}
export function createProject(d: Partial<Project>): Project {
  const info = getDb()
    .prepare(
      "INSERT INTO projects (client_id, name, service_type, status, budget, start_date, due_date, description) VALUES (@client_id, @name, @service_type, @status, @budget, @start_date, @due_date, @description)"
    )
    .run({
      client_id: Number(d.client_id),
      name: d.name ?? "",
      service_type: d.service_type ?? "",
      status: d.status ?? "planning",
      budget: Number(d.budget ?? 0),
      start_date: d.start_date ?? "",
      due_date: d.due_date ?? "",
      description: d.description ?? "",
    });
  return getProject(Number(info.lastInsertRowid))!;
}
export function updateProject(id: number, d: Partial<Project>): Project | undefined {
  const cur = getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project | undefined;
  if (!cur) return undefined;
  getDb()
    .prepare(
      "UPDATE projects SET client_id=@client_id, name=@name, service_type=@service_type, status=@status, budget=@budget, start_date=@start_date, due_date=@due_date, description=@description WHERE id=@id"
    )
    .run({
      ...cur,
      ...d,
      client_id: Number(d.client_id ?? cur.client_id),
      budget: Number(d.budget ?? cur.budget),
      id,
    });
  return getProject(id);
}
export function deleteProject(id: number): boolean {
  return getDb().prepare("DELETE FROM projects WHERE id = ?").run(id).changes > 0;
}

// ---------- Tasks ----------
const TASK_SELECT = `SELECT t.*, p.name AS project_name, tm.name AS assignee_name
  FROM tasks t
  LEFT JOIN projects p ON p.id = t.project_id
  LEFT JOIN team_members tm ON tm.id = t.assignee_id`;
export function listTasks(): Task[] {
  return getDb().prepare(`${TASK_SELECT} ORDER BY t.created_at DESC`).all() as Task[];
}
export function getTask(id: number): Task | undefined {
  return getDb().prepare(`${TASK_SELECT} WHERE t.id = ?`).get(id) as Task | undefined;
}
function nullableId(v: unknown): number | null {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return null;
  return Number(v);
}
export function createTask(d: Partial<Task>): Task {
  const info = getDb()
    .prepare(
      "INSERT INTO tasks (title, project_id, assignee_id, status, priority, due_date) VALUES (@title, @project_id, @assignee_id, @status, @priority, @due_date)"
    )
    .run({
      title: d.title ?? "",
      project_id: nullableId(d.project_id),
      assignee_id: nullableId(d.assignee_id),
      status: d.status ?? "todo",
      priority: d.priority ?? "medium",
      due_date: d.due_date ?? "",
    });
  return getTask(Number(info.lastInsertRowid))!;
}
export function updateTask(id: number, d: Partial<Task>): Task | undefined {
  const cur = getDb().prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
  if (!cur) return undefined;
  const merged = { ...cur, ...d };
  getDb()
    .prepare(
      "UPDATE tasks SET title=@title, project_id=@project_id, assignee_id=@assignee_id, status=@status, priority=@priority, due_date=@due_date WHERE id=@id"
    )
    .run({
      ...merged,
      project_id: "project_id" in d ? nullableId(d.project_id) : cur.project_id,
      assignee_id: "assignee_id" in d ? nullableId(d.assignee_id) : cur.assignee_id,
      id,
    });
  return getTask(id);
}
export function deleteTask(id: number): boolean {
  return getDb().prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
}

// ---------- Team ----------
export function listTeam(): TeamMember[] {
  return getDb().prepare("SELECT * FROM team_members ORDER BY name COLLATE NOCASE").all() as TeamMember[];
}
export function getTeamMember(id: number): TeamMember | undefined {
  return getDb().prepare("SELECT * FROM team_members WHERE id = ?").get(id) as TeamMember | undefined;
}
export function createTeamMember(d: Partial<TeamMember>): TeamMember {
  const info = getDb()
    .prepare("INSERT INTO team_members (name, role, email, phone) VALUES (@name, @role, @email, @phone)")
    .run({ name: d.name ?? "", role: d.role ?? "", email: d.email ?? "", phone: d.phone ?? "" });
  return getTeamMember(Number(info.lastInsertRowid))!;
}
export function updateTeamMember(id: number, d: Partial<TeamMember>): TeamMember | undefined {
  const cur = getTeamMember(id);
  if (!cur) return undefined;
  getDb()
    .prepare("UPDATE team_members SET name=@name, role=@role, email=@email, phone=@phone WHERE id=@id")
    .run({ ...cur, ...d, id });
  return getTeamMember(id);
}
export function deleteTeamMember(id: number): boolean {
  return getDb().prepare("DELETE FROM team_members WHERE id = ?").run(id).changes > 0;
}

// ---------- Invoices ----------
function invoiceItems(invoiceId: number): InvoiceItem[] {
  return getDb()
    .prepare("SELECT * FROM invoice_items WHERE invoice_id = ?")
    .all(invoiceId) as InvoiceItem[];
}
function hydrateInvoice(row: Invoice): Invoice {
  const items = invoiceItems(row.id);
  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  return { ...row, items, total };
}
const INVOICE_SELECT =
  "SELECT i.*, c.name AS client_name FROM invoices i LEFT JOIN clients c ON c.id = i.client_id";
export function listInvoices(): Invoice[] {
  const rows = getDb().prepare(`${INVOICE_SELECT} ORDER BY i.created_at DESC`).all() as Invoice[];
  return rows.map(hydrateInvoice);
}
export function getInvoice(id: number): Invoice | undefined {
  const row = getDb().prepare(`${INVOICE_SELECT} WHERE i.id = ?`).get(id) as Invoice | undefined;
  return row ? hydrateInvoice(row) : undefined;
}
function nextInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const row = getDb().prepare("SELECT COUNT(*) AS c FROM invoices").get() as { c: number };
  return `INV-${year}-${String(row.c + 1).padStart(3, "0")}`;
}
function replaceItems(invoiceId: number, items: InvoiceItem[]) {
  const db = getDb();
  db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?").run(invoiceId);
  const ins = db.prepare(
    "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)"
  );
  for (const it of items) {
    ins.run(invoiceId, it.description ?? "", Number(it.quantity ?? 1), Number(it.unit_price ?? 0));
  }
}
export function createInvoice(d: Partial<Invoice>): Invoice {
  const db = getDb();
  const create = db.transaction((data: Partial<Invoice>) => {
    const info = db
      .prepare(
        "INSERT INTO invoices (number, client_id, project_id, status, issue_date, due_date, notes) VALUES (@number, @client_id, @project_id, @status, @issue_date, @due_date, @notes)"
      )
      .run({
        number: data.number || nextInvoiceNumber(),
        client_id: Number(data.client_id),
        project_id: nullableId(data.project_id),
        status: data.status ?? "draft",
        issue_date: data.issue_date ?? "",
        due_date: data.due_date ?? "",
        notes: data.notes ?? "",
      });
    const id = Number(info.lastInsertRowid);
    replaceItems(id, data.items ?? []);
    return id;
  });
  return getInvoice(create(d))!;
}
export function updateInvoice(id: number, d: Partial<Invoice>): Invoice | undefined {
  const db = getDb();
  const cur = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as Invoice | undefined;
  if (!cur) return undefined;
  const update = db.transaction((data: Partial<Invoice>) => {
    db.prepare(
      "UPDATE invoices SET number=@number, client_id=@client_id, project_id=@project_id, status=@status, issue_date=@issue_date, due_date=@due_date, notes=@notes WHERE id=@id"
    ).run({
      ...cur,
      ...data,
      client_id: Number(data.client_id ?? cur.client_id),
      project_id: "project_id" in data ? nullableId(data.project_id) : cur.project_id,
      id,
    });
    if (data.items) replaceItems(id, data.items);
  });
  update(d);
  return getInvoice(id);
}
export function deleteInvoice(id: number): boolean {
  return getDb().prepare("DELETE FROM invoices WHERE id = ?").run(id).changes > 0;
}

// ---------- Content posts ----------
const POST_SELECT =
  "SELECT cp.*, c.name AS client_name FROM content_posts cp LEFT JOIN clients c ON c.id = cp.client_id";
export function listPosts(): ContentPost[] {
  return getDb().prepare(`${POST_SELECT} ORDER BY cp.scheduled_date ASC`).all() as ContentPost[];
}
export function getPost(id: number): ContentPost | undefined {
  return getDb().prepare(`${POST_SELECT} WHERE cp.id = ?`).get(id) as ContentPost | undefined;
}
export function createPost(d: Partial<ContentPost>): ContentPost {
  const info = getDb()
    .prepare(
      "INSERT INTO content_posts (client_id, platform, title, body, scheduled_date, status) VALUES (@client_id, @platform, @title, @body, @scheduled_date, @status)"
    )
    .run({
      client_id: Number(d.client_id),
      platform: d.platform ?? "Facebook",
      title: d.title ?? "",
      body: d.body ?? "",
      scheduled_date: d.scheduled_date ?? "",
      status: d.status ?? "draft",
    });
  return getPost(Number(info.lastInsertRowid))!;
}
export function updatePost(id: number, d: Partial<ContentPost>): ContentPost | undefined {
  const cur = getDb().prepare("SELECT * FROM content_posts WHERE id = ?").get(id) as
    | ContentPost
    | undefined;
  if (!cur) return undefined;
  getDb()
    .prepare(
      "UPDATE content_posts SET client_id=@client_id, platform=@platform, title=@title, body=@body, scheduled_date=@scheduled_date, status=@status WHERE id=@id"
    )
    .run({ ...cur, ...d, client_id: Number(d.client_id ?? cur.client_id), id });
  return getPost(id);
}
export function deletePost(id: number): boolean {
  return getDb().prepare("DELETE FROM content_posts WHERE id = ?").run(id).changes > 0;
}

// ---------- Dashboard ----------
export interface DashboardStats {
  activeClients: number;
  totalClients: number;
  openProjects: number;
  openTasks: number;
  pipelineValue: number;
  revenuePaid: number;
  revenueOutstanding: number;
  upcomingTasks: Task[];
  recentLeads: Lead[];
  upcomingPosts: ContentPost[];
  projectsByStatus: Record<string, number>;
  invoicesByStatus: Record<string, number>;
}
export function getDashboard(): DashboardStats {
  const db = getDb();
  const activeClients = (db.prepare("SELECT COUNT(*) c FROM clients WHERE status='active'").get() as { c: number }).c;
  const totalClients = (db.prepare("SELECT COUNT(*) c FROM clients").get() as { c: number }).c;
  const openProjects = (db.prepare("SELECT COUNT(*) c FROM projects WHERE status IN ('planning','active','on_hold')").get() as { c: number }).c;
  const openTasks = (db.prepare("SELECT COUNT(*) c FROM tasks WHERE status != 'done'").get() as { c: number }).c;
  const pipelineValue = (db.prepare("SELECT COALESCE(SUM(value),0) v FROM leads WHERE stage IN ('new','contacted','proposal')").get() as { v: number }).v;

  const invoiceTotals = db
    .prepare(
      `SELECT i.status AS status, COALESCE(SUM(ii.quantity * ii.unit_price), 0) AS total
       FROM invoices i LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
       GROUP BY i.status`
    )
    .all() as { status: string; total: number }[];
  let revenuePaid = 0;
  let revenueOutstanding = 0;
  for (const row of invoiceTotals) {
    if (row.status === "paid") revenuePaid += row.total;
    if (row.status === "sent" || row.status === "overdue") revenueOutstanding += row.total;
  }

  const upcomingTasks = db
    .prepare(`${TASK_SELECT} WHERE t.status != 'done' ORDER BY (t.due_date = '') ASC, t.due_date ASC LIMIT 6`)
    .all() as Task[];
  const recentLeads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 5").all() as Lead[];
  const upcomingPosts = db
    .prepare(`${POST_SELECT} WHERE cp.status != 'published' ORDER BY cp.scheduled_date ASC LIMIT 5`)
    .all() as ContentPost[];

  const projectsByStatus: Record<string, number> = {};
  for (const r of db.prepare("SELECT status, COUNT(*) c FROM projects GROUP BY status").all() as { status: string; c: number }[]) {
    projectsByStatus[r.status] = r.c;
  }
  const invoicesByStatus: Record<string, number> = {};
  for (const r of db.prepare("SELECT status, COUNT(*) c FROM invoices GROUP BY status").all() as { status: string; c: number }[]) {
    invoicesByStatus[r.status] = r.c;
  }

  return {
    activeClients,
    totalClients,
    openProjects,
    openTasks,
    pipelineValue,
    revenuePaid,
    revenueOutstanding,
    upcomingTasks,
    recentLeads,
    upcomingPosts,
    projectsByStatus,
    invoicesByStatus,
  };
}
