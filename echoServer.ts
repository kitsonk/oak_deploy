/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.fetchevent.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.ns.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.window.d.ts" />

import { Application } from "https://deno.land/x/oak@v7.2.0/mod.ts";

const app = new Application();

// Basic Logging
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url.pathname} - ${rt}`);
});

// Add timing to response headers
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const decoder = new TextDecoder();

// Echo back the request body as html, if any, as part of the response.
app.use(async (ctx) => {
  const { originalRequest } = ctx.request;
  console.log(`this.#request.body != null: ${originalRequest.body != null}`);
  console.log(
    `this.#request.headers.has("transfer-encoding"): ${
      originalRequest.headers.has("transfer-encoding")
    }`,
  );
  console.log(
    `!!parseInt(this.#request.headers.get("content-length") ?? "", 10)`,
    !!parseInt(
      originalRequest.headers.get("content-length") ?? "",
      10,
    ),
  );
  console.log(
    `this.#request.body instanceof ReadableStream: ${originalRequest
      .body instanceof ReadableStream}`,
  );
  if (ctx.request.hasBody) {
    const body = ctx.request.body();
    ctx.response.body = `<!DOCTYPE html><html><body>
          <h1>Body type: "${body.type}"</h1>`;
    switch (body.type) {
      case "form":
        ctx.response.body +=
          `<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>`;
        for (const [key, value] of await body.value) {
          ctx.response.body += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
        ctx.response.body += `</tbody></table>`;
        break;
      case "form-data": {
        const { fields } = await body.value.read();
        ctx.response.body +=
          `<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>`;
        for (const [key, value] of Object.entries(fields)) {
          ctx.response.body += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
        ctx.response.body += `</tbody></table>`;
        break;
      }
      case "text":
        ctx.response.body += `<pre>${body.value}</pre>`;
        break;
      case "json":
        ctx.response.body += `<pre>${
          JSON.stringify(await body.value, undefined, "  ")
        }</pre>`;
        break;
      case "bytes":
        ctx.response.body += `<h2>Content Type: "${
          ctx.request.headers.get("content-type")
        }"</h2>`;
        ctx.response.body += `<pre>${decoder.decode(await body.value)}</pre>`;
        break;
      default:
        ctx.response.body += `<p><strong>Body is Undefined</strong></p>`;
    }
    ctx.response.body += `</body></html>`;
  } else {
    ctx.response.body =
      `<!DOCTYPE html><html><body><h1>No Body</h1></body></html>`;
  }
});

app.addEventListener("error", (e) => {
  console.log("ERROR: ", e.error);
});

// Handle fetch events
addEventListener("fetch", app.fetchEventHandler());
