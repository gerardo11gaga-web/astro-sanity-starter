import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'store.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema first (reuse from db.ts logic inline)
// Just seed data assuming schema exists

const firstNames = ['James', 'Maria', 'Robert', 'Linda', 'Michael', 'Patricia', 'William', 'Jennifer', 'David', 'Elizabeth', 'Richard', 'Sarah', 'Joseph', 'Jessica', 'Thomas', 'Karen', 'Charles', 'Lisa', 'Chris', 'Nancy'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const types = ['hourly', 'hourly', 'hourly', 'cash', 'salary'];

console.log('Seeding 20 employees...');

const depts = db.prepare('SELECT * FROM departments').all() as any[];
if (depts.length === 0) {
  console.error('No departments found. Please start the app first to initialize the schema and seed departments.');
  process.exit(1);
}

const empStmt = db.prepare(`
  INSERT OR IGNORE INTO employees (first_name, last_name, phone, email, employee_type, max_hours_per_week, hire_date)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const deptStmt = db.prepare('INSERT OR IGNORE INTO employee_departments (employee_id, department_id, pay_rate) VALUES (?, ?, ?)');
const availStmt = db.prepare('INSERT OR IGNORE INTO availability_rules (employee_id, day_of_week, start_time, end_time, available) VALUES (?, ?, ?, ?, ?)');
const ptoStmt = db.prepare(`INSERT OR IGNORE INTO pto_requests (employee_id, request_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)`);

for (let i = 0; i < 20; i++) {
  const fn = firstNames[i];
  const ln = lastNames[i];
  const type = types[i % types.length];
  const maxHrs = type === 'salary' ? 40 : (20 + Math.floor(Math.random() * 20));
  const hireYear = 2019 + Math.floor(Math.random() * 5);
  const hireMonth = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const hireDay = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');

  const result = empStmt.run(fn, ln, `555-${String(1000 + i).slice(1)}-${String(1000 + i * 7).slice(1)}`, `${fn.toLowerCase()}.${ln.toLowerCase()}@store.com`, type, maxHrs, `${hireYear}-${hireMonth}-${hireDay}`);
  const empId = result.lastInsertRowid as number;
  if (!empId) continue;

  // Assign 1-3 departments
  const numDepts = 1 + Math.floor(Math.random() * 2);
  const shuffled = [...depts].sort(() => Math.random() - 0.5).slice(0, numDepts);
  for (const dept of shuffled) {
    deptStmt.run(empId, dept.id, (12 + Math.floor(Math.random() * 8)));
  }

  // Set availability for 4-6 days
  const workDays = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 3));
  for (const day of workDays) {
    const startH = 6 + Math.floor(Math.random() * 4);
    const endH = startH + 7 + Math.floor(Math.random() * 3);
    availStmt.run(empId, day, `${String(startH).padStart(2, '0')}:00`, `${String(endH).padStart(2, '0')}:00`, 1);
  }

  // Add some PTO requests
  if (Math.random() > 0.6) {
    const month = String(6 + Math.floor(Math.random() * 6)).padStart(2, '0');
    const day = String(1 + Math.floor(Math.random() * 20)).padStart(2, '0');
    const types2 = ['vacation', 'sick', 'personal'];
    const t = types2[Math.floor(Math.random() * types2.length)];
    const status = Math.random() > 0.5 ? 'approved' : 'pending';
    ptoStmt.run(empId, t, `2025-${month}-${day}`, `2025-${month}-${String(Number(day) + 2).padStart(2, '0')}`, 'Sample request', status);
  }
}

// Add manager user
const hash = bcrypt.hashSync('manager123', 10);
db.prepare("INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, 'manager')").run('manager@store.com', hash);

console.log('Seed complete! Added up to 20 employees.');
console.log('Manager login: manager@store.com / manager123');
