import { Application } from "https://deno.land/x/oak@v7.4.1/mod.ts";

const app = new Application();

Object.defineProperty(globalThis, "location", {
  value: { protocol: "https" },
  configurable: true,
  writable: false,
  enumerable: false,
});

app.use((ctx) => {
  ctx.response.body = `<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <h1>Explore</h1>
      <h2>Request Headers</h2>
      <p><pre>${
    JSON.stringify([...ctx.request.headers], undefined, "  ")
  }</pre></p>
      <h2>Deno.env</h2>
      <p><pre>${JSON.stringify(Deno.env.toObject(), undefined, "  ")}</pre></p>
      <h2>globalThis.location</h2>
      <p><pre>${
    JSON.stringify(Object.getOwnPropertyDescriptor(globalThis, "location"))
  }</pre></p>
    </body>
  </html>
  `;
});

addEventListener("fetch", app.fetchEventHandler());
