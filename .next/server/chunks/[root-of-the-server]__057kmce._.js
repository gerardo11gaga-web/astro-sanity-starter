module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),62294,e=>e.a(async(t,a)=>{try{var r=e.i(18520),i=t([r]);[r]=i.then?(await i)():i;let o=(0,r.createClient)({url:process.env.TURSO_DATABASE_URL||"file:local.db",authToken:process.env.TURSO_AUTH_TOKEN});async function s(e,t=[]){let a=await o.execute({sql:e,args:t});return a.rows.map(e=>{let t={};return a.columns.forEach((a,r)=>{t[a]=e[r]}),t})}async function E(e,t=[]){let a=await o.execute({sql:e,args:t});return{lastInsertRowid:a.lastInsertRowid??0,changes:a.rowsAffected}}async function n(){await o.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','manager','employee')),
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS employees (
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
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6366f1'
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS employee_departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    pay_rate REAL DEFAULT 0,
    qualified INTEGER DEFAULT 1,
    UNIQUE(employee_id, department_id)
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS availability_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT,
    end_time TEXT,
    available INTEGER DEFAULT 1,
    alternating TEXT DEFAULT 'none' CHECK(alternating IN ('none','even','odd'))
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS availability_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    available INTEGER DEFAULT 0,
    start_time TEXT,
    end_time TEXT,
    reason TEXT
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS pto_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK(request_type IN ('vacation','sick','personal','schedule_exception')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','denied')),
    manager_notes TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS departments_coverage_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    shift_type TEXT NOT NULL,
    minimum_staff INTEGER DEFAULT 1
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS store_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_key TEXT UNIQUE NOT NULL,
    rule_value TEXT NOT NULL,
    description TEXT
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS shift_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id)
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','approved','published')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    published_at DATETIME,
    notes TEXT
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS schedule_shifts (
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
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS time_entries (
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
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS payroll_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
    generated_at DATETIME,
    notes TEXT
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await o.execute(`CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);let t=await s("SELECT COUNT(*) as cnt FROM store_rules");if(t[0]?.cnt===0)for(let[e,t,a]of[["max_hours_per_week","40","Maximum hours per week before overtime"],["max_consecutive_days","6","Maximum consecutive work days"],["min_hours_between_shifts","8","Minimum hours between shifts (no close-open)"],["overtime_threshold","40","Weekly hours threshold for overtime"]])await E("INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)",[e,t,a]);let a=await s("SELECT COUNT(*) as cnt FROM departments");if(a[0]?.cnt===0)for(let[e,t]of[["Front End","#3b82f6"],["Produce","#22c55e"],["Meat","#ef4444"],["Grocery","#f59e0b"],["Deli","#8b5cf6"],["Bakery","#ec4899"]])await E("INSERT INTO departments (name, color) VALUES (?, ?)",[e,t]);let r=await s("SELECT COUNT(*) as cnt FROM bookmarks");if(r[0]?.cnt===0)for(let[e,t,a,r,i]of[["Schedule Manager","/manager/schedule","📅","#6366f1",1],["Employees","/manager/employees","👥","#22c55e",2],["PTO Queue","/manager/pto-queue","🗓️","#f59e0b",3],["Payroll","/manager/payroll","💰","#ec4899",4],["Settings","/manager/settings","⚙️","#64748b",5],["Market POS","https://app.marktpos.com/","🛒","#0ea5e9",6],["Revenue & Expenses","https://docs.google.com/spreadsheets/d/1Ixv27SxCO45EEAJwSy9OntV684Kqu18aXoruouHuRfs/edit","📊","#16a34a",7],["2026 Scheduling Sheet","https://docs.google.com/spreadsheets/d/1Zkw_Hn255ohWU6BUkz2EuF9sAzi10bOAfuxFKjxwwVA/edit","📆","#7c3aed",8],["Payroll Tracker","https://docs.google.com/spreadsheets/d/1mbfVPRybxb7N21uuxh-B_DmdJgFZf5PojDwKXtahFOc/edit","💵","#db2777",9],["Paychex Flex","https://login.flex.paychex.com/login_static/UsernameOnly.html","🏦","#b45309",10],["Gmail","https://mail.google.com/mail/u/0/#inbox","✉️","#dc2626",11],["Finance Dashboard","https://docs.google.com/spreadsheets/d/1D9G24Fvq_Z6L-P1LlEiXsUs1z8ebwttcOV1HEQfG8vc/edit","📈","#0891b2",12],["Google Drive","https://drive.google.com/drive/folders/1m2iyH8J2Ap2Ivn2fbEWAnNgR2k9fwgX0","📁","#ca8a04",13]])await E("INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)",[e,t,a,r,i]);let i=await s("SELECT COUNT(*) as cnt FROM users WHERE role='admin'");if(i[0]?.cnt===0){let t=await e.A(74658),a=await t.default.hash("admin123",10);await E("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",["admin@store.com",a])}}e.s(["initDb",0,n,"query",0,s,"run",0,E]),a()}catch(e){a(e)}},!1),91022,e=>{"use strict";e.s(["generateSchedule",0,function(e,t,a,r){let i=[],s=[],E={},n=Number(r.max_hours_per_week||40),o=Number(r.min_hours_between_shifts||8);for(let t of e)E[t.id]=0;for(let r of a){let d=new Date(r+"T12:00:00").getDay();for(let T of t.filter(e=>e.day_of_week===d)){let t=e.filter(e=>{if(!e.departments.some(e=>e.department_id===T.department_id)||!function(e,t){let a,r,i,s=new Date(t+"T12:00:00"),E=s.getDay(),n=(r=(a=new Date(Date.UTC(s.getFullYear(),s.getMonth(),s.getDate()))).getUTCDay()||7,a.setUTCDate(a.getUTCDate()+4-r),i=new Date(Date.UTC(a.getUTCFullYear(),0,1)),Math.ceil(((a.getTime()-i.getTime())/864e5+1)/7));for(let a of e.approvedPTO)if(t>=a.start_date&&t<=a.end_date)return!1;let o=e.overrides.find(e=>e.date===t);if(o)return 1===o.available;let d=e.availability.find(e=>e.day_of_week===E);return!!d&&0!==d.available&&("even"!==d.alternating||n%2==0)&&("odd"!==d.alternating||n%2!=0)}(e,r)||E[e.id]>=n)return!1;let t=a[a.indexOf(r)-1];if(t){let a=i.find(a=>a.employee_id===e.id&&a.date===t);if(a&&24-Number(a.end_time.split(":")[0])+Number(T.start_time.split(":")[0])<o)return!1}return!0}).sort((e,t)=>E[e.id]-E[t.id]),d=0;for(let e of t){if(d>=T.minimum_staff)break;let t=function(e,t){let[a,r]=e.split(":").map(Number),[i,s]=t.split(":").map(Number);return(60*i+s-60*a-r)/60}(T.start_time,T.end_time);!(E[e.id]+t>n+2)&&(i.push({employee_id:e.id,department_id:T.department_id,date:r,start_time:T.start_time,end_time:T.end_time,position:T.shift_type,hours:t}),E[e.id]+=t,E[e.id]>n&&s.push({type:"overtime",message:`${e.first_name} ${e.last_name} scheduled for ${E[e.id].toFixed(1)} hours (overtime risk)`}),d++)}d<T.minimum_staff&&s.push({type:"coverage_gap",message:`Coverage gap on ${r}: ${T.department_name} ${T.shift_type} needs ${T.minimum_staff} but only ${d} available`})}}return{shifts:i,warnings:s}}])},95757,e=>e.a(async(t,a)=>{try{var r=e.i(89171),i=e.i(62294),s=e.i(91022),E=t([i]);async function n(e){let t,{week_start:a,week_end:E}=await e.json(),n=await (0,i.query)(`
    SELECT COUNT(*) as cnt FROM pto_requests
    WHERE status = 'pending' AND start_date <= ? AND end_date >= ?
  `,[E,a]),o=n[0]?.cnt||0;if(o>0)return r.NextResponse.json({error:`Cannot generate schedule: ${o} pending PTO request(s) overlap this period.`},{status:409});let d=[],T=new Date(a+"T12:00:00");for(let e=0;e<7;e++){let t=new Date(T);t.setDate(T.getDate()+e),d.push(t.toISOString().split("T")[0])}let l=await (0,i.query)("SELECT * FROM employees WHERE active = 1");for(let e of l)e.departments=await (0,i.query)("SELECT ed.*, d.name as department_name FROM employee_departments ed JOIN departments d ON ed.department_id = d.id WHERE ed.employee_id = ?",[e.id]),e.availability=await (0,i.query)("SELECT * FROM availability_rules WHERE employee_id = ?",[e.id]),e.overrides=await (0,i.query)("SELECT * FROM availability_overrides WHERE employee_id = ? AND date BETWEEN ? AND ?",[e.id,a,E]),e.approvedPTO=await (0,i.query)("SELECT * FROM pto_requests WHERE employee_id = ? AND status = 'approved' AND start_date <= ? AND end_date >= ?",[e.id,E,a]);let u=await (0,i.query)(`
    SELECT dcr.*, d.name as department_name, sd.start_time, sd.end_time
    FROM departments_coverage_rules dcr
    JOIN departments d ON dcr.department_id = d.id
    LEFT JOIN shift_definitions sd ON sd.name = dcr.shift_type AND sd.department_id = dcr.department_id
    WHERE sd.id IS NOT NULL
  `),p=await (0,i.query)("SELECT * FROM store_rules"),N={};for(let e of p)N[e.rule_key]=e.rule_value;let{shifts:c,warnings:R}=(0,s.generateSchedule)(l,u,d,N),m=(await (0,i.query)("SELECT id FROM schedules WHERE week_start = ?",[a]))[0];for(let e of(m?(await (0,i.run)("DELETE FROM schedule_shifts WHERE schedule_id = ?",[m.id]),await (0,i.run)("UPDATE schedules SET status='draft', generated_at=CURRENT_TIMESTAMP WHERE id=?",[m.id]),t=m.id):t=(await (0,i.run)("INSERT INTO schedules (week_start, week_end) VALUES (?, ?)",[a,E])).lastInsertRowid,c))await (0,i.run)("INSERT INTO schedule_shifts (schedule_id, employee_id, department_id, date, start_time, end_time, position, hours_worked) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",[t,e.employee_id,e.department_id,e.date,e.start_time,e.end_time,e.position,e.hours]);return r.NextResponse.json({scheduleId:t,shiftCount:c.length,warnings:R})}[i]=E.then?(await E)():E,e.s(["POST",0,n]),a()}catch(e){a(e)}},!1),13970,e=>e.a(async(t,a)=>{try{var r=e.i(47909),i=e.i(74017),s=e.i(96250),E=e.i(59756),n=e.i(61916),o=e.i(74677),d=e.i(69741),T=e.i(16795),l=e.i(87718),u=e.i(95169),p=e.i(47587),N=e.i(66012),c=e.i(70101),R=e.i(26937),m=e.i(10372),_=e.i(93695);e.i(52474);var A=e.i(220),h=e.i(95757),I=t([h]);[h]=I.then?(await I)():I;let f=new r.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/schedule/generate/route",pathname:"/api/schedule/generate",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/schedule/generate/route.ts",nextConfigOutput:"",userland:h,...{}}),{workAsyncStorage:C,workUnitAsyncStorage:O,serverHooks:y}=f;async function L(e,t,a){a.requestMeta&&(0,E.setRequestMeta)(e,a.requestMeta),f.isDev&&(0,E.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/schedule/generate/route";r=r.replace(/\/index$/,"")||"/";let s=await f.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:h,deploymentId:I,params:L,nextConfig:C,parsedUrl:O,isDraftMode:y,prerenderManifest:U,routerServerContext:w,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,resolvedPathname:v,clientReferenceManifest:x,serverActionsManifest:D}=s,M=(0,d.normalizeAppPath)(r),F=!!(U.dynamicRoutes[M]||U.routes[v]),b=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,O,!1):t.end("This page could not be found"),null);if(F&&!y){let e=!!U.routes[v],t=U.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(C.adapterPath)return await b();throw new _.NoFallbackError}}let X=null;!F||f.isDev||y||(X=v,X="/index"===X?"/":X);let k=!0===f.isDev||!F,P=F&&!k;D&&x&&(0,o.setManifestsSingleton)({page:r,clientReferenceManifest:x,serverActionsManifest:D});let G=e.method||"GET",q=(0,n.getTracer)(),H=q.getActiveScopeSpan(),K=!!(null==w?void 0:w.isWrappedByNextServer),Y=!!(0,E.getRequestMeta)(e,"minimalMode"),B=(0,E.getRequestMeta)(e,"incrementalCache")||await f.getIncrementalCache(e,C,U,Y);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let j={params:L,previewProps:U.preview,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:k,incrementalCache:B,cacheLifeProfiles:C.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,i)=>f.onRequestError(e,t,r,i,w)},sharedContext:{buildId:h,deploymentId:I}},W=new T.NodeNextRequest(e),$=new T.NodeNextResponse(t),V=l.NextRequestAdapter.fromNodeNextRequest(W,(0,l.signalFromNodeResponse)(t));try{let s,E=async e=>f.handle(V,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=q.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=a.get("next.route");if(i){let t=`${G} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",i),s.updateName(t))}else e.updateName(`${G} ${r}`)}),o=async s=>{var n,o;let d=async({previousCacheEntry:i})=>{try{if(!Y&&S&&g&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await E(s);e.fetchMetrics=j.renderOpts.fetchMetrics;let n=j.renderOpts.pendingWaitUntil;n&&a.waitUntil&&(a.waitUntil(n),n=void 0);let o=j.renderOpts.collectedTags;if(!F)return await (0,N.sendResponse)(W,$,r,j.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(r.headers);o&&(t[m.NEXT_CACHE_TAGS_HEADER]=o),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,i=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:A.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await f.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:S})},!1,w),t}},T=await f.handleResponse({req:e,nextConfig:C,cacheKey:X,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:U,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:g,responseGenerator:d,waitUntil:a.waitUntil,isMinimalMode:Y});if(!F)return null;if((null==T||null==(n=T.value)?void 0:n.kind)!==A.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==T||null==(o=T.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});Y||t.setHeader("x-nextjs-cache",S?"REVALIDATED":T.isMiss?"MISS":T.isStale?"STALE":"HIT"),y&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,c.fromNodeOutgoingHttpHeaders)(T.value.headers);return Y&&F||l.delete(m.NEXT_CACHE_TAGS_HEADER),!T.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,R.getCacheControlHeader)(T.cacheControl)),await (0,N.sendResponse)(W,$,new Response(T.value.body,{headers:l,status:T.value.status||200})),null};K&&H?await o(H):(s=q.getActiveScopeSpan(),await q.withPropagatedContext(e.headers,()=>q.trace(u.BaseServerSpan.handleRequest,{spanName:`${G} ${r}`,kind:n.SpanKind.SERVER,attributes:{"http.method":G,"http.target":e.url}},o),void 0,!K))}catch(t){if(t instanceof _.NoFallbackError||await f.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:S})},!1,w),F)throw t;return await (0,N.sendResponse)(W,$,new Response(null,{status:500})),null}}e.s(["handler",0,L,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:O})},"routeModule",0,f,"serverHooks",0,y,"workAsyncStorage",0,C,"workUnitAsyncStorage",0,O]),a()}catch(e){a(e)}},!1),74658,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_bcryptjs_1s0xqd1._.js"].map(t=>e.l(t))).then(()=>t(43091)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__057kmce._.js.map