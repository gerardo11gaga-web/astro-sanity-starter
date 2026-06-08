import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'store.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','manager','employee')),
      employee_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      active INTEGER DEFAULT 1,
      employee_type TEXT DEFAULT 'hourly' CHECK(employee_type IN ('hourly','salary','flat_rate','cash')),
      max_hours_per_week REAL DEFAULT 40,
      hire_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#6366f1'
    );

    CREATE TABLE IF NOT EXISTS employee_departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
      pay_rate REAL DEFAULT 0,
      qualified INTEGER DEFAULT 1,
      UNIQUE(employee_id, department_id)
    );

    CREATE TABLE IF NOT EXISTS availability_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT,
      end_time TEXT,
      available INTEGER DEFAULT 1,
      alternating TEXT DEFAULT 'none' CHECK(alternating IN ('none','even','odd'))
    );

    CREATE TABLE IF NOT EXISTS availability_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      available INTEGER DEFAULT 0,
      start_time TEXT,
      end_time TEXT,
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS pto_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      request_type TEXT NOT NULL CHECK(request_type IN ('vacation','sick','personal','schedule_exception')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','denied')),
      manager_notes TEXT,
      submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS departments_coverage_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      shift_type TEXT NOT NULL,
      minimum_staff INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS store_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_key TEXT UNIQUE NOT NULL,
      rule_value TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS shift_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      department_id INTEGER REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft','approved','published')),
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      published_at DATETIME,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS schedule_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      department_id INTEGER REFERENCES departments(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      position TEXT,
      notes TEXT,
      hours_worked REAL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      schedule_shift_id INTEGER REFERENCES schedule_shifts(id),
      date TEXT NOT NULL,
      clock_in DATETIME,
      clock_out DATETIME,
      hours_worked REAL,
      department_id INTEGER REFERENCES departments(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payroll_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
      generated_at DATETIME,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT DEFAULT '🔗',
      color TEXT DEFAULT '#6366f1',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default store rules
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM store_rules').get() as { cnt: number };
  if (existing.cnt === 0) {
    const rules = [
      ['max_hours_per_week', '40', 'Maximum hours per week before overtime'],
      ['max_consecutive_days', '6', 'Maximum consecutive work days'],
      ['min_hours_between_shifts', '8', 'Minimum hours between shifts (no close-open)'],
      ['overtime_threshold', '40', 'Weekly hours threshold for overtime'],
    ];
    const stmt = db.prepare('INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)');
    for (const [k, v, d] of rules) stmt.run(k, v, d);
  }

  // Seed default departments
  const depts = db.prepare('SELECT COUNT(*) as cnt FROM departments').get() as { cnt: number };
  if (depts.cnt === 0) {
    const defaultDepts = [
      ['Front End', '#3b82f6'],
      ['Produce', '#22c55e'],
      ['Meat', '#ef4444'],
      ['Grocery', '#f59e0b'],
      ['Deli', '#8b5cf6'],
      ['Bakery', '#ec4899'],
    ];
    const stmt = db.prepare('INSERT INTO departments (name, color) VALUES (?, ?)');
    for (const [name, color] of defaultDepts) stmt.run(name, color);
  }

  // Seed default bookmarks
  const bmarks = db.prepare('SELECT COUNT(*) as cnt FROM bookmarks').get() as { cnt: number };
  if (bmarks.cnt === 0) {
    const defaultBookmarks = [
      ['Schedule Manager', '/manager/schedule', '📅', '#6366f1', 1],
      ['Employees', '/manager/employees', '👥', '#22c55e', 2],
      ['PTO Queue', '/manager/pto-queue', '🗓️', '#f59e0b', 3],
      ['Payroll', '/manager/payroll', '💰', '#ec4899', 4],
      ['Settings', '/manager/settings', '⚙️', '#64748b', 5],
      ['Market POS', 'https://app.marktpos.com/', '🛒', '#0ea5e9', 6],
      ['Revenue & Expenses', 'https://docs.google.com/spreadsheets/d/1Ixv27SxCO45EEAJwSy9OntV684Kqu18aXoruouHuRfs/edit', '📊', '#16a34a', 7],
      ['2026 Scheduling Sheet', 'https://docs.google.com/spreadsheets/d/1Zkw_Hn255ohWU6BUkz2EuF9sAzi10bOAfuxFKjxwwVA/edit', '📆', '#7c3aed', 8],
      ['Payroll Tracker', 'https://docs.google.com/spreadsheets/d/1mbfVPRybxb7N21uuxh-B_DmdJgFZf5PojDwKXtahFOc/edit', '💵', '#db2777', 9],
      ['Paychex Flex', 'https://login.flex.paychex.com/login_static/UsernameOnly.html', '🏦', '#b45309', 10],
      ['Gmail', 'https://mail.google.com/mail/u/0/#inbox', '✉️', '#dc2626', 11],
      ['Finance Dashboard', 'https://docs.google.com/spreadsheets/d/1D9G24Fvq_Z6L-P1LlEiXsUs1z8ebwttcOV1HEQfG8vc/edit', '📈', '#0891b2', 12],
      ['Google Drive', 'https://drive.google.com/drive/folders/1m2iyH8J2Ap2Ivn2fbEWAnNgR2k9fwgX0', '📁', '#ca8a04', 13],
    ];
    const stmt = db.prepare('INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)');
    for (const [title, url, icon, color, order] of defaultBookmarks) stmt.run(title, url, icon, color, order);
  }

  // Seed admin user (password: admin123)
  const adminExists = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role='admin'").get() as { cnt: number };
  if (adminExists.cnt === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run('admin@store.com', hash);
  }
}
