import { Application } from "https://deno.land/x/oak@v7.4.1/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

addEventListener("fetch", app.fetchEventHandler());
