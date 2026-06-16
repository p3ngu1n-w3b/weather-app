import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Singleton DB connection. Cached on globalThis so Next.js hot-reload in dev
// does not open a new handle (and re-run seeding) on every change.
const globalForDb = globalThis as unknown as { __ctDb?: Database.Database };

function createConnection(): Database.Database {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = new Database(path.join(dataDir, "creativetouch.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      industry TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'prospect',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'Website',
      service_interest TEXT NOT NULL DEFAULT '',
      stage TEXT NOT NULL DEFAULT 'new',
      value REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      service_type TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'planning',
      budget REAL NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      assignee_id INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      issue_date TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      description TEXT NOT NULL DEFAULT '',
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS content_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      platform TEXT NOT NULL DEFAULT 'Facebook',
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      scheduled_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seed(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS c FROM clients").get() as { c: number };
  if (count.c > 0) return;

  const insertTeam = db.prepare(
    "INSERT INTO team_members (name, role, email, phone) VALUES (?, ?, ?, ?)"
  );
  const team = [
    ["Lerato Mokoena", "Account Manager", "lerato@creativetouch.agency", "+27 82 780 9209"],
    ["Daniel van Wyk", "Social Media Manager", "daniel@creativetouch.agency", "+27 81 451 9531"],
    ["Aisha Patel", "Graphic Designer", "aisha@creativetouch.agency", "+27 71 234 5678"],
    ["Sipho Dlamini", "Web Developer", "sipho@creativetouch.agency", "+27 73 987 6543"],
    ["Megan Botha", "Copywriter & Photographer", "megan@creativetouch.agency", "+27 72 555 1212"],
  ];
  const teamIds = team.map((t) => Number(insertTeam.run(...t).lastInsertRowid));

  const insertClient = db.prepare(
    "INSERT INTO clients (name, contact_name, email, phone, industry, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const clients = [
    ["Garden Route Eats", "Johan Pretorius", "johan@greats.co.za", "+27 44 873 1100", "Hospitality", "active", "Restaurant group across George & Knysna. Monthly social media retainer."],
    ["Klein Karoo Wines", "Marie du Toit", "marie@kkwines.co.za", "+27 44 272 3344", "Food & Beverage", "active", "Wine estate. Needs product photography and seasonal campaigns."],
    ["Outeniqua Fitness", "Thabo Nkosi", "thabo@outeniquafit.co.za", "+27 82 110 2200", "Health & Fitness", "active", "Gym franchise. Social media + lead generation ads."],
    ["George Auto Spares", "Riaan Smit", "riaan@georgeauto.co.za", "+27 44 801 9090", "Automotive", "prospect", "Interested in website redesign and Google Ads."],
    ["Knysna Craft Collective", "Nomvula Zulu", "hello@knysnacraft.co.za", "+27 44 382 7766", "Retail", "inactive", "Past branding client. Potential re-engagement for summer."],
  ];
  const clientIds = clients.map((c) => Number(insertClient.run(...c).lastInsertRowid));

  const insertLead = db.prepare(
    "INSERT INTO leads (name, company, email, phone, source, service_interest, stage, value, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const leads = [
    ["Pieter Coetzee", "Mossel Bay Boats", "pieter@mbboats.co.za", "+27 44 690 1234", "Website", "Web Development", "new", 45000, "Wants a booking website for charters."],
    ["Sarah Ndlovu", "Bloom Florists", "sarah@bloom.co.za", "+27 82 334 5566", "Referral", "Social Media Management", "contacted", 8500, "Referred by Garden Route Eats. Monthly retainer."],
    ["Andre Fourie", "Karoo Biltong Co", "andre@karoobiltong.co.za", "+27 49 842 1100", "Social Media", "Product Photography", "proposal", 22000, "Proposal sent for photo shoot + packaging design."],
    ["Lindiwe Khumalo", "Eden Spa", "lindiwe@edenspa.co.za", "+27 44 870 2020", "Networking", "Brand Management", "won", 60000, "Signed full rebrand package."],
    ["Gerald Adams", "Adams Plumbing", "gerald@adamsplumb.co.za", "+27 73 221 9988", "Cold Outreach", "Marketing & Advertising", "lost", 12000, "Went with another agency."],
  ];
  leads.forEach((l) => insertLead.run(...l));

  const insertProject = db.prepare(
    "INSERT INTO projects (client_id, name, service_type, status, budget, start_date, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const projects: [number, string, string, string, number, string, string, string][] = [
    [clientIds[0], "Summer Social Campaign", "Social Media Management", "active", 35000, daysFromNow(-20), daysFromNow(40), "3-month summer content & ad campaign across Instagram and Facebook."],
    [clientIds[1], "Wine Range Photo Shoot", "Product Photography", "active", 28000, daysFromNow(-5), daysFromNow(15), "Product photography for the new reserve wine range."],
    [clientIds[2], "Lead Gen Ads Q3", "Marketing & Advertising", "planning", 18000, daysFromNow(7), daysFromNow(90), "Facebook & Google lead generation campaign for new members."],
    [clientIds[0], "Website Refresh", "Web Development", "on_hold", 52000, daysFromNow(-40), daysFromNow(60), "New responsive website with online reservations."],
    [clientIds[1], "Festive Season Branding", "Brand Management", "completed", 24000, daysFromNow(-90), daysFromNow(-10), "Festive campaign branding and collateral."],
  ];
  const projectIds = projects.map((p) => Number(insertProject.run(...p).lastInsertRowid));

  const insertTask = db.prepare(
    "INSERT INTO tasks (title, project_id, assignee_id, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const tasks: [string, number | null, number | null, string, string, string][] = [
    ["Draft January content calendar", projectIds[0], teamIds[1], "in_progress", "high", daysFromNow(2)],
    ["Design 6 Instagram post templates", projectIds[0], teamIds[2], "todo", "medium", daysFromNow(5)],
    ["Shoot reserve range (studio day)", projectIds[1], teamIds[4], "todo", "high", daysFromNow(3)],
    ["Edit and retouch wine photos", projectIds[1], teamIds[4], "todo", "medium", daysFromNow(10)],
    ["Set up ad account & pixel", projectIds[2], teamIds[3], "todo", "high", daysFromNow(8)],
    ["Write website copy", projectIds[3], teamIds[4], "in_progress", "medium", daysFromNow(12)],
    ["Client review meeting", projectIds[0], teamIds[0], "done", "low", daysFromNow(-3)],
    ["Approve festive collateral", projectIds[4], teamIds[0], "done", "medium", daysFromNow(-12)],
  ];
  tasks.forEach((t) => insertTask.run(...t));

  const insertInvoice = db.prepare(
    "INSERT INTO invoices (number, client_id, project_id, status, issue_date, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertItem = db.prepare(
    "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)"
  );
  const invoices: {
    number: string;
    client_id: number;
    project_id: number | null;
    status: string;
    issue_date: string;
    due_date: string;
    notes: string;
    items: [string, number, number][];
  }[] = [
    {
      number: "INV-2025-001",
      client_id: clientIds[0],
      project_id: projectIds[0],
      status: "paid",
      issue_date: daysFromNow(-30),
      due_date: daysFromNow(-15),
      notes: "Monthly social media retainer - December",
      items: [["Social media management retainer", 1, 12000], ["Ad spend management fee", 1, 3000]],
    },
    {
      number: "INV-2025-002",
      client_id: clientIds[1],
      project_id: projectIds[1],
      status: "sent",
      issue_date: daysFromNow(-10),
      due_date: daysFromNow(20),
      notes: "Deposit for product photography",
      items: [["Photography deposit (50%)", 1, 14000]],
    },
    {
      number: "INV-2025-003",
      client_id: clientIds[2],
      project_id: null,
      status: "overdue",
      issue_date: daysFromNow(-45),
      due_date: daysFromNow(-15),
      notes: "Strategy workshop",
      items: [["Marketing strategy workshop", 1, 9500]],
    },
    {
      number: "INV-2025-004",
      client_id: clientIds[1],
      project_id: projectIds[4],
      status: "draft",
      issue_date: daysFromNow(0),
      due_date: daysFromNow(30),
      notes: "Festive branding - final invoice",
      items: [["Brand collateral design", 1, 18000], ["Print management", 1, 6000]],
    },
  ];
  for (const inv of invoices) {
    const id = Number(
      insertInvoice.run(
        inv.number,
        inv.client_id,
        inv.project_id,
        inv.status,
        inv.issue_date,
        inv.due_date,
        inv.notes
      ).lastInsertRowid
    );
    for (const item of inv.items) insertItem.run(id, ...item);
  }

  const insertPost = db.prepare(
    "INSERT INTO content_posts (client_id, platform, title, body, scheduled_date, status) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const posts: [number, string, string, string, string, string][] = [
    [clientIds[0], "Instagram", "Summer Special Launch", "Beat the heat with our new summer menu! 🌞 #GardenRouteEats", daysFromNow(1), "scheduled"],
    [clientIds[0], "Facebook", "Weekend Live Music", "Join us this Saturday for live music and great food.", daysFromNow(3), "scheduled"],
    [clientIds[1], "Instagram", "Reserve Range Teaser", "Something special is uncorking soon... 🍷", daysFromNow(2), "draft"],
    [clientIds[2], "Facebook", "New Year New You", "Sign up in January and get your first month free!", daysFromNow(5), "draft"],
    [clientIds[0], "Instagram", "Behind the Scenes", "A peek into our kitchen this morning.", daysFromNow(-2), "published"],
  ];
  posts.forEach((p) => insertPost.run(...p));
}

export function getDb(): Database.Database {
  if (!globalForDb.__ctDb) {
    globalForDb.__ctDb = createConnection();
  }
  return globalForDb.__ctDb;
}
