var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.ts
var headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS"
};
var json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers }), "json");
async function body(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(body, "body");
async function user(env, id) {
  return await env.DB.prepare("SELECT * FROM users WHERE id=?").bind(id).first();
}
__name(user, "user");
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers });
    const url = new URL(request.url), path = url.pathname;
    try {
      if (path === "/api/health") return json({ ok: true, service: "ceonix-api", time: (/* @__PURE__ */ new Date()).toISOString() });
      if (path === "/api/login" && request.method === "POST") {
        const b = await body(request);
        const found = await env.DB.prepare("SELECT * FROM users WHERE lower(email)=lower(?)").bind(b.email || "").first();
        if (!found) return json({ error: "Employee account not found" }, 401);
        return json({ user: found, token: `ceonix-${found.id}` });
      }
      if (path === "/api/users" && request.method === "GET") {
        return json((await env.DB.prepare("SELECT * FROM users ORDER BY name").all()).results);
      }
      if (/^\/api\/users\/\d+$/.test(path) && request.method === "PATCH") {
        const id = Number(path.split("/")[3]), b = await body(request);
        await env.DB.prepare("UPDATE users SET name=?,role=?,department=?,phone=?,bio=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(b.name, b.role, b.department, b.phone || null, b.bio || null, id).run();
        return json(await user(env, id));
      }
      if (path === "/api/channels" && request.method === "GET") {
        return json((await env.DB.prepare("SELECT * FROM channels ORDER BY id").all()).results);
      }
      if (path.startsWith("/api/messages/") && request.method === "GET") {
        const channel = path.split("/").pop();
        return json((await env.DB.prepare(`
SELECT m.id,m.content,m.created_at,u.id user_id,u.name,u.initials
FROM messages m JOIN users u ON u.id=m.user_id
JOIN channels c ON c.id=m.channel_id
WHERE c.name=? ORDER BY m.id
`).bind(channel).all()).results);
      }
      if (path === "/api/messages" && request.method === "POST") {
        const b = await body(request);
        if (!b.channelId || !b.userId || !b.content?.trim()) return json({ error: "Missing fields" }, 400);
        const r = await env.DB.prepare("INSERT INTO messages(channel_id,user_id,content) VALUES(?,?,?)").bind(b.channelId, b.userId, b.content.trim()).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (path === "/api/meals" && request.method === "GET") {
        return json((await env.DB.prepare(`
SELECT m.*,COUNT(v.id) votes FROM meals m
LEFT JOIN meal_votes v ON v.meal_id=m.id
WHERE m.meal_date=date('now')
GROUP BY m.id ORDER BY votes DESC,m.id
`).all()).results);
      }
      if (path === "/api/meals" && request.method === "POST") {
        const b = await body(request);
        if (!b.name?.trim()) return json({ error: "Meal name required" }, 400);
        const r = await env.DB.prepare("INSERT INTO meals(name,emoji,meal_date,created_by) VALUES(?,?,date('now'),?)").bind(b.name.trim(), b.emoji || "???", b.userId).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (/^\/api\/meals\/\d+\/vote$/.test(path) && request.method === "POST") {
        const id = Number(path.split("/")[3]), b = await body(request);
        try {
          await env.DB.prepare("INSERT INTO meal_votes(meal_id,user_id) VALUES(?,?)").bind(id, b.userId).run();
          return json({ ok: true });
        } catch {
          return json({ error: "Already voted for this meal" }, 409);
        }
      }
      if (path === "/api/polls" && request.method === "GET") {
        const polls = (await env.DB.prepare("SELECT p.*,u.name author FROM polls p JOIN users u ON u.id=p.created_by ORDER BY p.id DESC").all()).results;
        for (const p of polls) p.options = (await env.DB.prepare("SELECT o.id,o.label,COUNT(v.id) votes FROM poll_options o LEFT JOIN poll_votes v ON v.option_id=o.id WHERE o.poll_id=? GROUP BY o.id ORDER BY o.position").bind(p.id).all()).results;
        return json(polls);
      }
      if (path === "/api/polls" && request.method === "POST") {
        const b = await body(request);
        if (!b.question?.trim() || !b.options?.length || b.options.length < 2) return json({ error: "Invalid poll" }, 400);
        const r = await env.DB.prepare("INSERT INTO polls(question,created_by,closes_at) VALUES(?,?,datetime('now','+7 days'))").bind(b.question.trim(), b.userId).run();
        for (let i = 0; i < b.options.length; i++) await env.DB.prepare("INSERT INTO poll_options(poll_id,label,position) VALUES(?,?,?)").bind(r.meta.last_row_id, b.options[i], i + 1).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (/^\/api\/polls\/\d+\/vote$/.test(path) && request.method === "POST") {
        const id = Number(path.split("/")[3]), b = await body(request);
        try {
          await env.DB.prepare("INSERT INTO poll_votes(poll_id,option_id,user_id) VALUES(?,?,?)").bind(id, b.optionId, b.userId).run();
          return json({ ok: true });
        } catch {
          return json({ error: "Already voted in this poll" }, 409);
        }
      }
      if (path === "/api/announcements" && request.method === "GET") {
        return json((await env.DB.prepare("SELECT a.*,u.name author,u.initials FROM announcements a JOIN users u ON u.id=a.author_id ORDER BY a.pinned DESC,a.id DESC").all()).results);
      }
      if (path === "/api/announcements" && request.method === "POST") {
        const b = await body(request);
        if (!b.title?.trim() || !b.body?.trim()) return json({ error: "Title and message required" }, 400);
        const r = await env.DB.prepare("INSERT INTO announcements(title,body,author_id,pinned) VALUES(?,?,?,?)").bind(b.title.trim(), b.body.trim(), b.userId, b.pinned ? 1 : 0).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (path === "/api/events" && request.method === "GET") {
        return json((await env.DB.prepare("SELECT e.*,u.name creator FROM events e LEFT JOIN users u ON u.id=e.created_by ORDER BY starts_at").all()).results);
      }
      if (path === "/api/events" && request.method === "POST") {
        const b = await body(request);
        if (!b.title?.trim() || !b.startsAt) return json({ error: "Title and date required" }, 400);
        const r = await env.DB.prepare("INSERT INTO events(title,description,location,starts_at,ends_at,created_by) VALUES(?,?,?,?,?,?)").bind(b.title.trim(), b.description || "", b.location || "", b.startsAt, b.endsAt || null, b.userId).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (path === "/api/requests" && request.method === "GET") {
        return json((await env.DB.prepare("SELECT r.*,u.name user_name FROM requests r JOIN users u ON u.id=r.user_id ORDER BY r.id DESC").all()).results);
      }
      if (path === "/api/requests" && request.method === "POST") {
        const b = await body(request);
        if (!b.type || !b.title?.trim()) return json({ error: "Type and title required" }, 400);
        const r = await env.DB.prepare("INSERT INTO requests(user_id,type,title,description) VALUES(?,?,?,?)").bind(b.userId, b.type, b.title.trim(), b.description || "").run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (/^\/api\/requests\/\d+$/.test(path) && request.method === "PATCH") {
        const id = Number(path.split("/")[3]), b = await body(request);
        await env.DB.prepare("UPDATE requests SET status=?,reviewed_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(b.status, b.userId, id).run();
        return json({ ok: true });
      }
      if (path === "/api/notifications" && request.method === "GET") {
        const id = Number(url.searchParams.get("userId") || 1);
        return json((await env.DB.prepare("SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC").bind(id).all()).results);
      }
      if (/^\/api\/notifications\/\d+\/read$/.test(path) && request.method === "PATCH") {
        const id = Number(path.split("/")[3]);
        await env.DB.prepare("UPDATE notifications SET is_read=1 WHERE id=?").bind(id).run();
        return json({ ok: true });
      }
      if (path === "/api/notifications/read-all" && request.method === "PATCH") {
        const b = await body(request);
        await env.DB.prepare("UPDATE notifications SET is_read=1 WHERE user_id=?").bind(b.userId).run();
        return json({ ok: true });
      }
      if (path === "/api/settings" && request.method === "GET") {
        const id = Number(url.searchParams.get("userId") || 1);
        return json(await env.DB.prepare("SELECT * FROM user_settings WHERE user_id=?").bind(id).first());
      }
      if (path === "/api/settings" && request.method === "PATCH") {
        const b = await body(request);
        await env.DB.prepare(`UPDATE user_settings SET email_notifications=?,chat_notifications=?,meal_notifications=?,poll_notifications=?,compact_mode=? WHERE user_id=?`).bind(b.email_notifications ? 1 : 0, b.chat_notifications ? 1 : 0, b.meal_notifications ? 1 : 0, b.poll_notifications ? 1 : 0, b.compact_mode ? 1 : 0, b.userId).run();
        return json({ ok: true });
      }
      if (path === "/api/files" && request.method === "GET") {
        return json((await env.DB.prepare(`
SELECT f.*,u.name uploader,u.initials
FROM files f JOIN users u ON u.id=f.uploaded_by
ORDER BY f.id DESC
`).all()).results);
      }
      if (path === "/api/files/upload" && request.method === "POST") {
        const form = await request.formData();
        const file = form.get("file");
        const userId = Number(form.get("userId") || 1);
        if (!(file instanceof File)) return json({ error: "File required" }, 400);
        if (file.size > 25 * 1024 * 1024) return json({ error: "Maximum file size is 25 MB" }, 400);
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `${Date.now()}-${crypto.randomUUID()}-${safe}`;
        await env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
        const r = await env.DB.prepare("INSERT INTO files(name,object_key,mime_type,size,uploaded_by) VALUES(?,?,?,?,?)").bind(file.name, key, file.type || "application/octet-stream", file.size, userId).run();
        return json({ ok: true, id: r.meta.last_row_id }, 201);
      }
      if (/^\/api\/files\/\d+\/download$/.test(path) && request.method === "GET") {
        const id = Number(path.split("/")[3]);
        const meta = await env.DB.prepare("SELECT * FROM files WHERE id=?").bind(id).first();
        if (!meta) return json({ error: "File not found" }, 404);
        const object = await env.FILES.get(meta.object_key);
        if (!object) return json({ error: "Stored object not found" }, 404);
        const h = new Headers();
        object.writeHttpMetadata(h);
        h.set("Content-Disposition", `attachment; filename="${String(meta.name).replace(/"/g, "")}"`);
        h.set("Access-Control-Allow-Origin", "*");
        h.set("ETag", object.httpEtag);
        return new Response(object.body, { headers: h });
      }
      if (/^\/api\/files\/\d+$/.test(path) && request.method === "DELETE") {
        const id = Number(path.split("/")[3]);
        const meta = await env.DB.prepare("SELECT * FROM files WHERE id=?").bind(id).first();
        if (!meta) return json({ error: "File not found" }, 404);
        await env.FILES.delete(meta.object_key);
        await env.DB.prepare("DELETE FROM files WHERE id=?").bind(id).run();
        return json({ ok: true });
      }
      if (path === "/api/dashboard" && request.method === "GET") {
        const employees = await env.DB.prepare("SELECT COUNT(*) count FROM users").first();
        const online = await env.DB.prepare("SELECT COUNT(*) count FROM users WHERE status='online'").first();
        const polls = await env.DB.prepare("SELECT COUNT(*) count FROM polls WHERE status='active'").first();
        const requests = await env.DB.prepare("SELECT COUNT(*) count FROM requests WHERE status='pending'").first();
        const announcements = (await env.DB.prepare("SELECT a.*,u.name author FROM announcements a JOIN users u ON u.id=a.author_id ORDER BY a.id DESC LIMIT 3").all()).results;
        const events = (await env.DB.prepare("SELECT * FROM events WHERE starts_at>=datetime('now') ORDER BY starts_at LIMIT 4").all()).results;
        return json({ employees: employees?.count || 0, online: online?.count || 0, polls: polls?.count || 0, requests: requests?.count || 0, announcements, events });
      }
      return json({ error: "Not found" }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, 500);
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body2 = JSON.stringify(error);
    const headers2 = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body2);
    if (encoded.length <= 8192) {
      headers2["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body2, { status: 500, headers: headers2 });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-rkIKiu/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-rkIKiu/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
