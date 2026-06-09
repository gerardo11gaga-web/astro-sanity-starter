module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),62294,e=>e.a(async(t,a)=>{try{var r=e.i(18520),s=t([r]);[r]=s.then?(await s)():s;let i=(0,r.createClient)({url:process.env.TURSO_DATABASE_URL||"file:local.db",authToken:process.env.TURSO_AUTH_TOKEN});async function E(e,t=[]){let a=await i.execute({sql:e,args:t});return a.rows.map(e=>{let t={};return a.columns.forEach((a,r)=>{t[a]=e[r]}),t})}async function o(e,t=[]){let a=await i.execute({sql:e,args:t});return{lastInsertRowid:a.lastInsertRowid??0,changes:a.rowsAffected}}async function n(){await i.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','manager','employee')),
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS employees (
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
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6366f1'
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS employee_departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    pay_rate REAL DEFAULT 0,
    qualified INTEGER DEFAULT 1,
    UNIQUE(employee_id, department_id)
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS availability_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT,
    end_time TEXT,
    available INTEGER DEFAULT 1,
    alternating TEXT DEFAULT 'none' CHECK(alternating IN ('none','even','odd'))
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS availability_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    available INTEGER DEFAULT 0,
    start_time TEXT,
    end_time TEXT,
    reason TEXT
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS pto_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK(request_type IN ('vacation','sick','personal','schedule_exception')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','denied')),
    manager_notes TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS departments_coverage_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    shift_type TEXT NOT NULL,
    minimum_staff INTEGER DEFAULT 1
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS store_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_key TEXT UNIQUE NOT NULL,
    rule_value TEXT NOT NULL,
    description TEXT
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS shift_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id)
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','approved','published')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    published_at DATETIME,
    notes TEXT
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS schedule_shifts (
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
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS time_entries (
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
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS payroll_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
    generated_at DATETIME,
    notes TEXT
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await i.execute(`CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);let t=await E("SELECT COUNT(*) as cnt FROM store_rules");if(t[0]?.cnt===0)for(let[e,t,a]of[["max_hours_per_week","40","Maximum hours per week before overtime"],["max_consecutive_days","6","Maximum consecutive work days"],["min_hours_between_shifts","8","Minimum hours between shifts (no close-open)"],["overtime_threshold","40","Weekly hours threshold for overtime"]])await o("INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)",[e,t,a]);let a=await E("SELECT COUNT(*) as cnt FROM departments");if(a[0]?.cnt===0)for(let[e,t]of[["Front End","#3b82f6"],["Produce","#22c55e"],["Meat","#ef4444"],["Grocery","#f59e0b"],["Deli","#8b5cf6"],["Bakery","#ec4899"]])await o("INSERT INTO departments (name, color) VALUES (?, ?)",[e,t]);let r=await E("SELECT COUNT(*) as cnt FROM bookmarks");if(r[0]?.cnt===0)for(let[e,t,a,r,s]of[["Schedule Manager","/manager/schedule","📅","#6366f1",1],["Employees","/manager/employees","👥","#22c55e",2],["PTO Queue","/manager/pto-queue","🗓️","#f59e0b",3],["Payroll","/manager/payroll","💰","#ec4899",4],["Settings","/manager/settings","⚙️","#64748b",5],["Market POS","https://app.marktpos.com/","🛒","#0ea5e9",6],["Revenue & Expenses","https://docs.google.com/spreadsheets/d/1Ixv27SxCO45EEAJwSy9OntV684Kqu18aXoruouHuRfs/edit","📊","#16a34a",7],["2026 Scheduling Sheet","https://docs.google.com/spreadsheets/d/1Zkw_Hn255ohWU6BUkz2EuF9sAzi10bOAfuxFKjxwwVA/edit","📆","#7c3aed",8],["Payroll Tracker","https://docs.google.com/spreadsheets/d/1mbfVPRybxb7N21uuxh-B_DmdJgFZf5PojDwKXtahFOc/edit","💵","#db2777",9],["Paychex Flex","https://login.flex.paychex.com/login_static/UsernameOnly.html","🏦","#b45309",10],["Gmail","https://mail.google.com/mail/u/0/#inbox","✉️","#dc2626",11],["Finance Dashboard","https://docs.google.com/spreadsheets/d/1D9G24Fvq_Z6L-P1LlEiXsUs1z8ebwttcOV1HEQfG8vc/edit","📈","#0891b2",12],["Google Drive","https://drive.google.com/drive/folders/1m2iyH8J2Ap2Ivn2fbEWAnNgR2k9fwgX0","📁","#ca8a04",13]])await o("INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)",[e,t,a,r,s]);let s=await E("SELECT COUNT(*) as cnt FROM users WHERE role='admin'");if(s[0]?.cnt===0){let t=await e.A(74658),a=await t.default.hash("admin123",10);await o("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",["admin@store.com",a])}}e.s(["initDb",0,n,"query",0,E,"run",0,o]),a()}catch(e){a(e)}},!1),87001,e=>e.a(async(t,a)=>{try{var r=e.i(89171),s=e.i(62294),E=t([s]);async function o(e){let{start_date:t,end_date:a}=await e.json(),E=await (0,s.query)(`
    SELECT ss.employee_id, ss.department_id, ss.hours_worked, ss.date,
           e.first_name, e.last_name, e.employee_type, e.max_hours_per_week,
           d.name as department_name,
           ed.pay_rate
    FROM schedule_shifts ss
    JOIN employees e ON ss.employee_id = e.id
    LEFT JOIN departments d ON ss.department_id = d.id
    LEFT JOIN employee_departments ed ON ed.employee_id = ss.employee_id AND ed.department_id = ss.department_id
    WHERE ss.date BETWEEN ? AND ?
    ORDER BY e.last_name, e.first_name, ss.date
  `,[t,a]),o={};for(let e of E){o[e.employee_id]||(o[e.employee_id]={employee_id:e.employee_id,name:`${e.first_name} ${e.last_name}`,employee_type:e.employee_type,departments:{},total_hours:0,regular_hours:0,overtime_hours:0,gross_pay:0});let t=o[e.employee_id],a=e.hours_worked||0;t.total_hours+=a,t.departments[e.department_id]||(t.departments[e.department_id]={name:e.department_name,hours:0,pay_rate:e.pay_rate||0,subtotal:0}),t.departments[e.department_id].hours+=a}for(let e of Object.values(o)){for(let t of(e.regular_hours=Math.min(e.total_hours,40),e.overtime_hours=Math.max(0,e.total_hours-40),Object.values(e.departments)))t.subtotal=t.hours*t.pay_rate,e.gross_pay+=t.subtotal;e.departments=Object.values(e.departments)}return r.NextResponse.json({employees:Object.values(o),start_date:t,end_date:a})}[s]=E.then?(await E)():E,e.s(["POST",0,o]),a()}catch(e){a(e)}},!1),9977,e=>e.a(async(t,a)=>{try{var r=e.i(47909),s=e.i(74017),E=e.i(96250),o=e.i(59756),n=e.i(61916),i=e.i(74677),T=e.i(69741),d=e.i(16795),l=e.i(87718),p=e.i(95169),u=e.i(47587),N=e.i(66012),c=e.i(70101),R=e.i(26937),m=e.i(10372),_=e.i(93695);e.i(52474);var A=e.i(220),I=e.i(87001),h=t([I]);[I]=h.then?(await h)():h;let O=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/payroll/route",pathname:"/api/payroll",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/payroll/route.ts",nextConfigOutput:"",userland:I,...{}}),{workAsyncStorage:C,workUnitAsyncStorage:y,serverHooks:U}=O;async function L(e,t,a){a.requestMeta&&(0,o.setRequestMeta)(e,a.requestMeta),O.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/payroll/route";r=r.replace(/\/index$/,"")||"/";let E=await O.prepare(e,t,{srcPage:r,multiZoneDraftMode:!1});if(!E)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:I,deploymentId:h,params:L,nextConfig:C,parsedUrl:y,isDraftMode:U,prerenderManifest:f,routerServerContext:w,isOnDemandRevalidate:S,revalidateOnlyGenerated:x,resolvedPathname:v,clientReferenceManifest:g,serverActionsManifest:M}=E,F=(0,T.normalizeAppPath)(r),D=!!(f.dynamicRoutes[F]||f.routes[v]),X=async()=>((null==w?void 0:w.render404)?await w.render404(e,t,y,!1):t.end("This page could not be found"),null);if(D&&!U){let e=!!f.routes[v],t=f.dynamicRoutes[F];if(t&&!1===t.fallback&&!e){if(C.adapterPath)return await X();throw new _.NoFallbackError}}let b=null;!D||O.isDev||U||(b=v,b="/index"===b?"/":b);let P=!0===O.isDev||!D,k=D&&!P;M&&g&&(0,i.setManifestsSingleton)({page:r,clientReferenceManifest:g,serverActionsManifest:M});let G=e.method||"GET",K=(0,n.getTracer)(),q=K.getActiveScopeSpan(),H=!!(null==w?void 0:w.isWrappedByNextServer),Y=!!(0,o.getRequestMeta)(e,"minimalMode"),B=(0,o.getRequestMeta)(e,"incrementalCache")||await O.getIncrementalCache(e,C,f,Y);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let j={params:L,previewProps:f.preview,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:P,incrementalCache:B,cacheLifeProfiles:C.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,s)=>O.onRequestError(e,t,r,s,w)},sharedContext:{buildId:I,deploymentId:h}},V=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),$=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(t));try{let E,o=async e=>O.handle($,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=K.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=a.get("next.route");if(s){let t=`${G} ${s}`;e.setAttributes({"next.route":s,"http.route":s,"next.span_name":t}),e.updateName(t),E&&E!==e&&(E.setAttribute("http.route",s),E.updateName(t))}else e.updateName(`${G} ${r}`)}),i=async E=>{var n,i;let T=async({previousCacheEntry:s})=>{try{if(!Y&&S&&x&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await o(E);e.fetchMetrics=j.renderOpts.fetchMetrics;let n=j.renderOpts.pendingWaitUntil;n&&a.waitUntil&&(a.waitUntil(n),n=void 0);let i=j.renderOpts.collectedTags;if(!D)return await (0,N.sendResponse)(V,W,r,j.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(r.headers);i&&(t[m.NEXT_CACHE_TAGS_HEADER]=i),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,s=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:A.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:s}}}}catch(t){throw(null==s?void 0:s.isStale)&&await O.onRequestError(e,t,{routerKind:"App Router",routePath:r,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:S})},!1,w),t}},d=await O.handleResponse({req:e,nextConfig:C,cacheKey:b,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:f,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:x,responseGenerator:T,waitUntil:a.waitUntil,isMinimalMode:Y});if(!D)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==A.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});Y||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),U&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,c.fromNodeOutgoingHttpHeaders)(d.value.headers);return Y&&D||l.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,R.getCacheControlHeader)(d.cacheControl)),await (0,N.sendResponse)(V,W,new Response(d.value.body,{headers:l,status:d.value.status||200})),null};H&&q?await i(q):(E=K.getActiveScopeSpan(),await K.withPropagatedContext(e.headers,()=>K.trace(p.BaseServerSpan.handleRequest,{spanName:`${G} ${r}`,kind:n.SpanKind.SERVER,attributes:{"http.method":G,"http.target":e.url}},i),void 0,!H))}catch(t){if(t instanceof _.NoFallbackError||await O.onRequestError(e,t,{routerKind:"App Router",routePath:F,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:k,isOnDemandRevalidate:S})},!1,w),D)throw t;return await (0,N.sendResponse)(V,W,new Response(null,{status:500})),null}}e.s(["handler",0,L,"patchFetch",0,function(){return(0,E.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:y})},"routeModule",0,O,"serverHooks",0,U,"workAsyncStorage",0,C,"workUnitAsyncStorage",0,y]),a()}catch(e){a(e)}},!1),74658,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_bcryptjs_1s0xqd1._.js"].map(t=>e.l(t))).then(()=>t(43091)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0-306lb._.js.map