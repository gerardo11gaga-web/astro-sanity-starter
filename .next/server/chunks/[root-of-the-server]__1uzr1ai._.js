module.exports=[18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18520,e=>e.a(async(t,a)=>{try{let t=await e.y("@libsql/client-6da938047d5fc1cd");e.n(t),a()}catch(e){a(e)}},!0),62294,e=>e.a(async(t,a)=>{try{var E=e.i(18520),r=t([E]);[E]=r.then?(await r)():r;let T=(0,E.createClient)({url:process.env.TURSO_DATABASE_URL||"file:local.db",authToken:process.env.TURSO_AUTH_TOKEN});async function s(e,t=[]){let a=await T.execute({sql:e,args:t});return a.rows.map(e=>{let t={};return a.columns.forEach((a,E)=>{t[a]=e[E]}),t})}async function i(e,t=[]){let a=await T.execute({sql:e,args:t});return{lastInsertRowid:a.lastInsertRowid??0,changes:a.rowsAffected}}async function n(){await T.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','manager','employee')),
    employee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS employees (
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
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6366f1'
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS employee_departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    pay_rate REAL DEFAULT 0,
    qualified INTEGER DEFAULT 1,
    UNIQUE(employee_id, department_id)
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS availability_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT,
    end_time TEXT,
    available INTEGER DEFAULT 1,
    alternating TEXT DEFAULT 'none' CHECK(alternating IN ('none','even','odd'))
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS availability_overrides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    available INTEGER DEFAULT 0,
    start_time TEXT,
    end_time TEXT,
    reason TEXT
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS pto_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK(request_type IN ('vacation','sick','personal','schedule_exception')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','denied')),
    manager_notes TEXT,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS departments_coverage_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    shift_type TEXT NOT NULL,
    minimum_staff INTEGER DEFAULT 1
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS store_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_key TEXT UNIQUE NOT NULL,
    rule_value TEXT NOT NULL,
    description TEXT
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS shift_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id)
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','approved','published')),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    published_at DATETIME,
    notes TEXT
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS schedule_shifts (
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
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS time_entries (
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
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS payroll_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK(status IN ('open','closed')),
    generated_at DATETIME,
    notes TEXT
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`),await T.execute(`CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT '🔗',
    color TEXT DEFAULT '#6366f1',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);let t=await s("SELECT COUNT(*) as cnt FROM store_rules");if(t[0]?.cnt===0)for(let[e,t,a]of[["max_hours_per_week","40","Maximum hours per week before overtime"],["max_consecutive_days","6","Maximum consecutive work days"],["min_hours_between_shifts","8","Minimum hours between shifts (no close-open)"],["overtime_threshold","40","Weekly hours threshold for overtime"]])await i("INSERT INTO store_rules (rule_key, rule_value, description) VALUES (?, ?, ?)",[e,t,a]);let a=await s("SELECT COUNT(*) as cnt FROM departments");if(a[0]?.cnt===0)for(let[e,t]of[["Front End","#3b82f6"],["Produce","#22c55e"],["Meat","#ef4444"],["Grocery","#f59e0b"],["Deli","#8b5cf6"],["Bakery","#ec4899"]])await i("INSERT INTO departments (name, color) VALUES (?, ?)",[e,t]);let E=await s("SELECT COUNT(*) as cnt FROM bookmarks");if(E[0]?.cnt===0)for(let[e,t,a,E,r]of[["Schedule Manager","/manager/schedule","📅","#6366f1",1],["Employees","/manager/employees","👥","#22c55e",2],["PTO Queue","/manager/pto-queue","🗓️","#f59e0b",3],["Payroll","/manager/payroll","💰","#ec4899",4],["Settings","/manager/settings","⚙️","#64748b",5],["Market POS","https://app.marktpos.com/","🛒","#0ea5e9",6],["Revenue & Expenses","https://docs.google.com/spreadsheets/d/1Ixv27SxCO45EEAJwSy9OntV684Kqu18aXoruouHuRfs/edit","📊","#16a34a",7],["2026 Scheduling Sheet","https://docs.google.com/spreadsheets/d/1Zkw_Hn255ohWU6BUkz2EuF9sAzi10bOAfuxFKjxwwVA/edit","📆","#7c3aed",8],["Payroll Tracker","https://docs.google.com/spreadsheets/d/1mbfVPRybxb7N21uuxh-B_DmdJgFZf5PojDwKXtahFOc/edit","💵","#db2777",9],["Paychex Flex","https://login.flex.paychex.com/login_static/UsernameOnly.html","🏦","#b45309",10],["Gmail","https://mail.google.com/mail/u/0/#inbox","✉️","#dc2626",11],["Finance Dashboard","https://docs.google.com/spreadsheets/d/1D9G24Fvq_Z6L-P1LlEiXsUs1z8ebwttcOV1HEQfG8vc/edit","📈","#0891b2",12],["Google Drive","https://drive.google.com/drive/folders/1m2iyH8J2Ap2Ivn2fbEWAnNgR2k9fwgX0","📁","#ca8a04",13]])await i("INSERT INTO bookmarks (title, url, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)",[e,t,a,E,r]);let r=await s("SELECT COUNT(*) as cnt FROM users WHERE role='admin'");if(r[0]?.cnt===0){let t=await e.A(74658),a=await t.default.hash("admin123",10);await i("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')",["admin@store.com",a])}}e.s(["initDb",0,n,"query",0,s,"run",0,i]),a()}catch(e){a(e)}},!1),88783,e=>e.a(async(t,a)=>{try{var E=e.i(89171),r=e.i(62294),s=t([r]);async function i(e,{params:t}){let{id:a}=await t;return await (0,r.run)("DELETE FROM bookmarks WHERE id = ?",[a]),E.NextResponse.json({success:!0})}[r]=s.then?(await s)():s,e.s(["DELETE",0,i]),a()}catch(e){a(e)}},!1),25793,e=>e.a(async(t,a)=>{try{var E=e.i(47909),r=e.i(74017),s=e.i(96250),i=e.i(59756),n=e.i(61916),T=e.i(74677),o=e.i(69741),d=e.i(16795),l=e.i(87718),u=e.i(95169),N=e.i(47587),c=e.i(66012),p=e.i(70101),R=e.i(26937),A=e.i(10372),I=e.i(93695);e.i(52474);var m=e.i(220),L=e.i(88783),h=t([L]);[L]=h.then?(await h)():h;let C=new E.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/bookmarks/[id]/route",pathname:"/api/bookmarks/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/bookmarks/[id]/route.ts",nextConfigOutput:"",userland:L,...{}}),{workAsyncStorage:U,workUnitAsyncStorage:O,serverHooks:w}=C;async function _(e,t,a){a.requestMeta&&(0,i.setRequestMeta)(e,a.requestMeta),C.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let E="/api/bookmarks/[id]/route";E=E.replace(/\/index$/,"")||"/";let s=await C.prepare(e,t,{srcPage:E,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:L,deploymentId:h,params:_,nextConfig:U,parsedUrl:O,isDraftMode:w,prerenderManifest:S,routerServerContext:f,isOnDemandRevalidate:y,revalidateOnlyGenerated:x,resolvedPathname:v,clientReferenceManifest:g,serverActionsManifest:M}=s,D=(0,o.normalizeAppPath)(E),F=!!(S.dynamicRoutes[D]||S.routes[v]),X=async()=>((null==f?void 0:f.render404)?await f.render404(e,t,O,!1):t.end("This page could not be found"),null);if(F&&!w){let e=!!S.routes[v],t=S.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(U.adapterPath)return await X();throw new I.NoFallbackError}}let b=null;!F||C.isDev||w||(b=v,b="/index"===b?"/":b);let k=!0===C.isDev||!F,P=F&&!k;M&&g&&(0,T.setManifestsSingleton)({page:E,clientReferenceManifest:g,serverActionsManifest:M});let G=e.method||"GET",K=(0,n.getTracer)(),q=K.getActiveScopeSpan(),H=!!(null==f?void 0:f.isWrappedByNextServer),Y=!!(0,i.getRequestMeta)(e,"minimalMode"),B=(0,i.getRequestMeta)(e,"incrementalCache")||await C.getIncrementalCache(e,U,S,Y);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let j={params:_,previewProps:S.preview,renderOpts:{experimental:{authInterrupts:!!U.experimental.authInterrupts},cacheComponents:!!U.cacheComponents,supportsDynamicResponse:k,incrementalCache:B,cacheLifeProfiles:U.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,E,r)=>C.onRequestError(e,t,E,r,f)},sharedContext:{buildId:L,deploymentId:h}},V=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),$=l.NextRequestAdapter.fromNodeNextRequest(V,(0,l.signalFromNodeResponse)(t));try{let s,i=async e=>C.handle($,j).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=K.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${G} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",r),s.updateName(t))}else e.updateName(`${G} ${E}`)}),T=async s=>{var n,T;let o=async({previousCacheEntry:r})=>{try{if(!Y&&y&&x&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let E=await i(s);e.fetchMetrics=j.renderOpts.fetchMetrics;let n=j.renderOpts.pendingWaitUntil;n&&a.waitUntil&&(a.waitUntil(n),n=void 0);let T=j.renderOpts.collectedTags;if(!F)return await (0,c.sendResponse)(V,W,E,j.renderOpts.pendingWaitUntil),null;{let e=await E.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(E.headers);T&&(t[A.NEXT_CACHE_TAGS_HEADER]=T),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=A.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,r=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=A.INFINITE_CACHE?void 0:j.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:E.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==r?void 0:r.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,N.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:y})},!1,f),t}},d=await C.handleResponse({req:e,nextConfig:U,cacheKey:b,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:y,revalidateOnlyGenerated:x,responseGenerator:o,waitUntil:a.waitUntil,isMinimalMode:Y});if(!F)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(T=d.value)?void 0:T.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});Y||t.setHeader("x-nextjs-cache",y?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),w&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let l=(0,p.fromNodeOutgoingHttpHeaders)(d.value.headers);return Y&&F||l.delete(A.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||l.get("Cache-Control")||l.set("Cache-Control",(0,R.getCacheControlHeader)(d.cacheControl)),await (0,c.sendResponse)(V,W,new Response(d.value.body,{headers:l,status:d.value.status||200})),null};H&&q?await T(q):(s=K.getActiveScopeSpan(),await K.withPropagatedContext(e.headers,()=>K.trace(u.BaseServerSpan.handleRequest,{spanName:`${G} ${E}`,kind:n.SpanKind.SERVER,attributes:{"http.method":G,"http.target":e.url}},T),void 0,!H))}catch(t){if(t instanceof I.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,N.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:y})},!1,f),F)throw t;return await (0,c.sendResponse)(V,W,new Response(null,{status:500})),null}}e.s(["handler",0,_,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:U,workUnitAsyncStorage:O})},"routeModule",0,C,"serverHooks",0,w,"workAsyncStorage",0,U,"workUnitAsyncStorage",0,O]),a()}catch(e){a(e)}},!1),74658,e=>{e.v(t=>Promise.all(["server/chunks/[externals]_bcryptjs_1s0xqd1._.js"].map(t=>e.l(t))).then(()=>t(43091)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1uzr1ai._.js.map