(()=>{var e={};e.id=597,e.ids=[597],e.modules={4729:e=>{"use strict";e.exports=require("bcryptjs")},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},2924:(e,t,E)=>{"use strict";E.r(t),E.d(t,{patchFetch:()=>_,routeModule:()=>o,serverHooks:()=>l,workAsyncStorage:()=>N,workUnitAsyncStorage:()=>p});var r={};E.r(r),E.d(r,{POST:()=>n});var T=E(2706),a=E(8203),s=E(5994),i=E(9187),d=E(6448);async function n(e){let t;let{week_start:E,week_end:r}=await e.json(),T=(0,d.L)(),a=T.prepare(`
    SELECT COUNT(*) as cnt FROM pto_requests
    WHERE status = 'pending' AND start_date <= ? AND end_date >= ?
  `).get(r,E);if(a.cnt>0)return i.NextResponse.json({error:`Cannot generate schedule: ${a.cnt} pending PTO request(s) overlap this period.`},{status:409});let s=[],n=new Date(E+"T12:00:00");for(let e=0;e<7;e++){let t=new Date(n);t.setDate(n.getDate()+e),s.push(t.toISOString().split("T")[0])}let o=T.prepare("SELECT * FROM employees WHERE active = 1").all();for(let e of o)e.departments=T.prepare("SELECT ed.*, d.name as department_name FROM employee_departments ed JOIN departments d ON ed.department_id = d.id WHERE ed.employee_id = ?").all(e.id),e.availability=T.prepare("SELECT * FROM availability_rules WHERE employee_id = ?").all(e.id),e.overrides=T.prepare("SELECT * FROM availability_overrides WHERE employee_id = ? AND date BETWEEN ? AND ?").all(e.id,E,r),e.approvedPTO=T.prepare("SELECT * FROM pto_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?").all(e.id,r,E);let N=T.prepare(`
    SELECT dcr.*, d.name as department_name, sd.start_time, sd.end_time
    FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id
    LEFT JOIN shift_definitions sd ON sd.name = dcr.shift_type AND sd.department_id = dcr.department_id
    WHERE sd.id IS NOT NULL
  `).all(),p=T.prepare("SELECT * FROM store_rules").all(),l={};for(let e of p)l[e.rule_key]=e.rule_value;let{shifts:_,warnings:R}=function(e,t,E,r){let T=[],a=[],s={},i=Number(r.max_hours_per_week||40),d=Number(r.min_hours_between_shifts||8);for(let t of e)s[t.id]=0;for(let r of E){let n=new Date(r+"T12:00:00").getDay();for(let o of t.filter(e=>e.day_of_week===n)){let t=e.filter(e=>{if(!e.departments.some(e=>e.department_id===o.department_id)||!function(e,t){let E=new Date(t+"T12:00:00"),r=E.getDay(),T=function(e){let t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),E=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-E);let r=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t.getTime()-r.getTime())/864e5+1)/7)}(E);for(let E of e.approvedPTO)if(t>=E.start_date&&t<=E.end_date)return!1;let a=e.overrides.find(e=>e.date===t);if(a)return 1===a.available;let s=e.availability.find(e=>e.day_of_week===r);return!!s&&0!==s.available&&("even"!==s.alternating||T%2==0)&&("odd"!==s.alternating||T%2!=0)}(e,r)||s[e.id]>=i)return!1;let t=E[E.indexOf(r)-1];if(t){let E=T.find(E=>E.employee_id===e.id&&E.date===t);if(E&&24-Number(E.end_time.split(":")[0])+Number(o.start_time.split(":")[0])<d)return!1}return!0}).sort((e,t)=>s[e.id]-s[t.id]),n=0;for(let e of t){if(n>=o.minimum_staff)break;let t=function(e,t){let[E,r]=e.split(":").map(Number),[T,a]=t.split(":").map(Number);return(60*T+a-60*E-r)/60}(o.start_time,o.end_time);!(s[e.id]+t>i+2)&&(T.push({employee_id:e.id,department_id:o.department_id,date:r,start_time:o.start_time,end_time:o.end_time,position:o.shift_type,hours:t}),s[e.id]+=t,s[e.id]>i&&a.push({type:"overtime",message:`${e.first_name} ${e.last_name} scheduled for ${s[e.id].toFixed(1)} hours (overtime risk)`}),n++)}n<o.minimum_staff&&a.push({type:"coverage_gap",message:`Coverage gap on ${r}: ${o.department_name} ${o.shift_type} needs ${o.minimum_staff} but only ${n} available`})}}return{shifts:T,warnings:a}}(o,N,s,l),u=T.prepare("SELECT id FROM schedules WHERE week_start = ?").get(E);u?(T.prepare("DELETE FROM schedule_shifts WHERE schedule_id = ?").run(u.id),T.prepare("UPDATE schedules SET status='draft', generated_at=CURRENT_TIMESTAMP WHERE id=?").run(u.id),t=u.id):t=T.prepare("INSERT INTO schedules (week_start, week_end) VALUES (?, ?)").run(E,r).lastInsertRowid;let m=T.prepare("INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, hours_worked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");for(let e of _)m.run(t,e.employee_id,e.department_id,e.date,e.start_time,e.end_time,e.position,e.hours);return i.NextResponse.json({scheduleId:t,shiftCount:_.length,warnings:R})}let o=new T.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/schedule/generate/route",pathname:"/api/schedule/generate",filename:"route",bundlePath:"app/api/schedule/generate/route"},resolvedPagePath:"/home/user/astro-sanity-starter/.claude/worktrees/agent-a398a3ecdd1c1a217/app/api/schedule/generate/route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:N,workUnitAsyncStorage:p,serverHooks:l}=o;function _(){return(0,s.patchFetch)({workAsyncStorage:N,workUnitAsyncStorage:p})}},6487:()=>{},8335:()=>{},6448:(e,t,E)=>{"use strict";let r;E.d(t,{L:()=>l});let T=require("better-sqlite3");var a=E.n(T),s=E(3873),i=E.n(s);let d=require("fs");var n=E.n(d),o=E(4729),N=E.n(o);let p=process.env.DB_PATH||i().join(process.cwd(),"data","store.db");function l(){if(!r){let e=i().dirname(p);n().existsSync(e)||n().mkdirSync(e,{recursive:!0}),(r=new(a())(p)).pragma("journal_mode = WAL"),r.pragma("foreign_keys = ON"),function(e){if(e.exec(`
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
  `),0===e.prepare("SELECT COUNT(*) as cnt FROM store_rules").get().cnt){let t=e.prepare("INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)");for(let[e,E,r]of[["max_hours_per_week","40","Maximum hours per week before overtime"],["max_consecutive_days","6","Maximum consecutive work days"],["min_hours_between_shifts","8","Minimum hours between shifts (no close-open)"],["overtime_threshold","40","Weekly hours threshold for overtime"]])t.run(e,E,r)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM departments").get().cnt){let t=e.prepare("INSERT INTO departments (name, color) VALUES (?, ?)");for(let[e,E]of[["Front End","#3b82f6"],["Produce","#22c55e"],["Meat","#ef4444"],["Grocery","#f59e0b"],["Deli","#8b5cf6"],["Bakery","#ec4899"]])t.run(e,E)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM bookmarks").get().cnt){let t=e.prepare("INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)");for(let[e,E,r,T,a]of[["Schedule Manager","/manager/schedule","\uD83D\uDCC5","#6366f1",1],["Employees","/manager/employees","\uD83D\uDC65","#22c55e",2],["PTO Queue","/manager/pto-queue","\uD83D\uDDD3️","#f59e0b",3],["Payroll","/manager/payroll","\uD83D\uDCB0","#ec4899",4],["Settings","/manager/settings","⚙️","#64748b",5]])t.run(e,E,r,T,a)}if(0===e.prepare("SELECT COUNT(*) as cnt FROM users WHERE role='admin'").get().cnt){let t=N().hashSync("admin123",10);e.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')").run("admin@store.com",t)}}(r)}return r}}};var t=require("../../../../webpack-runtime.js");t.C(e);var E=e=>t(t.s=e),r=t.X(0,[638,452],()=>E(2924));module.exports=r})();