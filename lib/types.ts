// Domain types for Creative Touch Business Hub

export type ClientStatus = "active" | "prospect" | "inactive";

export interface Client {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  status: ClientStatus;
  notes: string;
  created_at: string;
}

export type LeadStage = "new" | "contacted" | "proposal" | "won" | "lost";

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  service_interest: string;
  stage: LeadStage;
  value: number;
  notes: string;
  created_at: string;
}

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

export interface Project {
  id: number;
  client_id: number;
  name: string;
  service_type: string;
  status: ProjectStatus;
  budget: number;
  start_date: string;
  due_date: string;
  description: string;
  created_at: string;
  // joined
  client_name?: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  project_id: number | null;
  assignee_id: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  created_at: string;
  // joined
  project_name?: string;
  assignee_name?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  created_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: number;
  number: string;
  client_id: number;
  project_id: number | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  notes: string;
  created_at: string;
  items: InvoiceItem[];
  // joined / computed
  client_name?: string;
  total?: number;
}

export type PostStatus = "draft" | "scheduled" | "published";

export interface ContentPost {
  id: number;
  client_id: number;
  platform: string;
  title: string;
  body: string;
  scheduled_date: string;
  status: PostStatus;
  created_at: string;
  // joined
  client_name?: string;
}

// Option lists shared across UI and validation
export const SERVICE_TYPES = [
  "Social Media Management",
  "Marketing & Advertising",
  "Brand Management",
  "Web Development",
  "Custom Software",
  "Product Photography",
  "Graphic Design",
  "Copywriting",
  "Training",
  "Corporate Gifts",
] as const;

export const PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "X", "TikTok", "YouTube"] as const;

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Social Media",
  "Cold Outreach",
  "Networking",
  "Walk-in",
] as const;

export const CLIENT_STATUSES: ClientStatus[] = ["active", "prospect", "inactive"];
export const LEAD_STAGES: LeadStage[] = ["new", "contacted", "proposal", "won", "lost"];
export const PROJECT_STATUSES: ProjectStatus[] = ["planning", "active", "on_hold", "completed"];
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
export const POST_STATUSES: PostStatus[] = ["draft", "scheduled", "published"];
