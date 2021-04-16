# oak on Deploy Example

This is just a basic example of [oak]() running on [Deno Deploy](). It simply
echos back the body it was sent in the response to the client. The app is
deployed on (oak-deploy-example.deno.dev)[https://oak-deploy-example.deno.dev].

The URL `https://github.com/kitsonk/echoServer.ts` is what gets deployed, and
that is it, and every time I push to the GitHub repo, Deno Deploy will redeploy
my application. 🪄

I added these 3 lines to the top so that when I was editing the main module,
I was getting the proper intellisense with the Deno Language Server in my IDE:

```ts
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.fetchevent.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.ns.d.ts" />
/// <reference path="https://raw.githubusercontent.com/denoland/deployctl/main/types/deploy.window.d.ts" />
```

Importing oak, just like in the Deno CLI, is super straight forward:

```ts
import { Application } from "https://deno.land/x/oak@v7.1.0/mod.ts";
```

Yup, it is that simple!

If you are familiar with oak (or Express or Koa), you would normally expect an
`app.listen()`, but the strategy with Deno Deploy is just to "handle" the
requests, so in this case we pass the web standard `Request` into oak and have
it process it:

```ts
addEventListener("fetch", async (requestEvent) => {
  let resolve: (response: Response) => void;
  const p = new Promise<Response>((r) => resolve = r);
  const r = requestEvent.respondWith(p);
  const response = await app.handle(requestEvent.request);
  if (response) {
    resolve!(response);
  } else {
    resolve!(
      new Response("Internal Error - Failed to return response from handler.", {
        status: 500,
        statusText: "InternalError",
      }),
    );
  }
  await r;
});
```

Looking at that again, it does feel a bit boiler-platey, so maybe it would be
nice to have a helper method that gets exported, so you would just do:

```ts
addEventListener("fetch", app.fetchEventHandler);
```

(Now that I have written it, I need to do that, but maybe later).
