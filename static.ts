import { Application, proxy } from "https://deno.land/x/oak@v7.6.2/mod.ts";
import {
  contentType,
  lookup,
} from "https://deno.land/x/media_types@v2.9.0/mod.ts";

const app = new Application();

app.use(proxy(new URL("./static/", import.meta.url), {
  map: {
    "/": "/index.html",
  },
  contentType(url, ct) {
    if (ct) {
      ct = contentType(ct);
    }
    const impliedContentType = contentType(lookup(url) ?? "");
    if (ct !== impliedContentType) {
      return impliedContentType;
    }
  },
}));

app.use(async (ctx, next) => {
  ctx.response.headers.delete("content-security-policy");
  await next();
});

app.addEventListener("error", (evt) => {
  if ("stack" in evt.error) {
    console.log(evt.error.stack);
  } else if ("message" in evt.error) {
    console.log(evt.error.message);
  } else {
    console.log(`An undefined application error occurred.`);
  }
});

addEventListener("fetch", app.fetchEventHandler());
