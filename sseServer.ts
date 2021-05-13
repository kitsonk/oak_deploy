/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.fetchevent.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.ns.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.window.d.ts" />

import {
  Application,
  Context,
  isHttpError,
  Router,
  ServerSentEvent,
  Status,
} from "https://deno.land/x/oak@v7.4.1/mod.ts";

function notFound(ctx: Context) {
  ctx.response.status = Status.NotFound;
  ctx.response.body =
    `<html><body><h1>404 - Not Found</h1><p>Path <code>${ctx.request.url}</code> not found.`;
}

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.response.body = `<!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <h1>Hello world!</h1>
        <ul id="events"></ul>
        <script>
          const sse = new EventSource("/sse");
          const ul = document.getElementById("events");
          sse.onmessage = (evt) => {
            const li = document.createElement("li");
            li.textContent = \`message: \${evt.data}\`;
            ul.appendChild(li);
          };
        </script>
      </body>
    </html>
    `;
  })
  // for any clients that request the `/sse` endpoint, we will send a message
  // every 2 seconds.
  .get("/sse", (ctx: Context) => {
    ctx.assert(
      ctx.request.accepts("text/event-stream"),
      Status.UnsupportedMediaType,
    );
    const connection = ctx.request.ip;
    const target = ctx.sendEvents();
    console.log(`SSE connect ${connection}`);
    let counter = 0;
    const id = setInterval(() => {
      const evt = new ServerSentEvent(
        "message",
        { hello: "world" },
        { id: counter++ },
      );
      target.dispatchEvent(evt);
    }, 2000);
    target.addEventListener("close", () => {
      console.log(`SSE disconnect" ${connection}`);
      clearInterval(id);
    });
  });

const app = new Application();

// Logger
app.use(async (context, next) => {
  await next();
  const rt = context.response.headers.get("X-Response-Time");
  console.log(
    `${context.request.method} ${context.request.url.pathname} - ${String(rt)}`,
  );
});

// Response Time
app.use(async (context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  context.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Error handler
app.use(async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      context.response.status = err.status;
      const { message, status, stack } = err;
      if (context.request.accepts("json")) {
        context.response.body = { message, status, stack };
        context.response.type = "json";
      } else {
        context.response.body = `${status} ${message}\n\n${stack ?? ""}`;
        context.response.type = "text/plain";
      }
    } else {
      console.log(err);
      throw err;
    }
  }
});

// Use the router
app.use(router.routes());
app.use(router.allowedMethods());

// A basic 404 page
app.use(notFound);

app.addEventListener("error", (e) => {
  console.log("ERROR: ", e.error);
});

// Handle fetch events
addEventListener("fetch", app.fetchEventHandler());
