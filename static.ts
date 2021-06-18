import { Application, proxy } from "https://deno.land/x/oak@v7.6.1/mod.ts";

const app = new Application();

app.use(proxy(new URL("./", import.meta.url), {
  map: {
    "/": "/index.html",
  },
}));

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
