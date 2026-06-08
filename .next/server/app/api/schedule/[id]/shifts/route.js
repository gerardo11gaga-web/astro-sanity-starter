(()=>{var e={};e.id=11,e.ids=[11],e.modules={4729:e=>{"use strict";e.exports=require("bcryptjs")},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},2403:(e,E,T)=>{"use strict";T.r(E),T.d(E,{patchFetch:()=>l,routeModule:()=>R,serverHooks:()=>L,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>I});var t={};T.r(t),T.d(t,{DELETE:()=>n,POST:()=>o,PUT:()=>d});var r=T(2706),s=T(8203),a=T(5994),i=T(9187),N=T(6448);async function o(e,{params:E}){let{id:T}=await E,t=await e.json(),r=(0,N.L)().prepare(`
    INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, notes, hours_worked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(T,t.employee_id,t.department_id||null,t.date,t.start_time,t.end_time,t.position||null,t.notes||null,t.hours_worked||null);return i.NextResponse.json({id:r.lastInsertRowid})}async function d(e){let E=await e.json();return(0,N.L)().prepare("UPDATE schedule_shifts SET employee_id=?, department_id=?, start_time=?, end_time=?, position=?, notes=? WHERE id=?").run(E.employee_id,E.department_id,E.start_time,E.end_time,E.position,E.notes,E.shift_id),i.NextResponse.json({success:!0})}async function n(e){let{shift_id:E}=await e.json();return(0,N.L)().prepare("DELETE FROM schedule_shifts WHERE id = ?").run(E),i.NextResponse.json({success:!0})}let R=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/schedule/[id]/shifts/route",pathname:"/api/schedule/[id]/shifts",filename:"route",bundlePath:"app/api/schedule/[id]/shifts/route"},resolvedPagePath:"/home/user/astro-sanity-starter/.claude/worktrees/agent-a398a3ecdd1c1a217/app/api/schedule/[id]/shifts/route.ts",nextConfigOutput:"",userland:t}),{workAsyncStorage:p,workUnitAsyncStorage:I,serverHooks:L}=R;function l(){return(0,a.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:I})}},6487:()=>{},8335:()=>{},6448:(e,E,T)=>{"use strict";let t;T.d(E,{L:()=>p});let r=require("better-sqlite3");var s=T.n(r),a=T(3873),i=T.n(a);let N=require("fs");var o=T.n(N),d=T(4729),n=T.n(d);let R=process.env.DB_PATH||i().join(process.cwd(),"data","store.db");function p(){if(!t){let e=i().dirname(R);o().existsSync(e)||o().mkdirSync(e,{recursive:!0}),(t=new(s())(R)).pragma("journal_mode = WAL"),t.pragma("foreign_keys = ON"),function(e){if(e.exec(`
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
  `),0===e.prepare("SELECT COUNT(*) as cnt FROM store_rules").get().cnt){let E=e.prepare("INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)");for(let[e,T,t]of[["max_hours_per_week","40","Maximum hours per week before overtime"],["max_consecutive_days","6","Maximum consecutive work days"],["min_hours_between_shifts","8","Minimum hours between shifts (no close-open)"],["overtime_threshold","40","Weekly hours threshold for overtime"]])E.run(e,T,t)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM departments").get().cnt){let E=e.prepare("INSERT INTO departments (name, color) VALUES (?, ?)");for(let[e,T]of[["Front End","#3b82f6"],["Produce","#22c55e"],["Meat","#ef4444"],["Grocery","#f59e0b"],["Deli","#8b5cf6"],["Bakery","#ec4899"]])E.run(e,T)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM bookmarks").get().cnt){let E=e.prepare("INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)");for(let[e,T,t,r,s]of[["Schedule Manager","/manager/schedule","\uD83D\uDCC5","#6366f1",1],["Employees","/manager/employees","\uD83D\uDC65","#22c55e",2],["PTO Queue","/manager/pto-queue","\uD83D\uDDD3️","#f59e0b",3],["Payroll","/manager/payroll","\uD83D\uDCB0","#ec4899",4],["Settings","/manager/settings","⚙️","#64748b",5]])E.run(e,T,t,r,s)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM users WHERE role='admin'").get().cnt){let E=n().hashSync("admin123",10);e.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run("admin@store.com",E)}}(t)}return t}}};var E=require("../../../../../webpack-runtime.js");E.C(e);var T=e=>E(E.s=e),t=E.X(0,[638,452],()=>T(2403));module.exports=t})();