# oak on Deploy Example

This is just a basic example of [oak]() running on [Deno Deploy](). It simply
echos back the body it was sent in the response to the client. The app is
deployed on (oak-deploy-example.deno.dev)[https://oak-deploy-example.deno.dev].

The URL `https://github.com/kitsonk/echoServer.ts` is what gets deployed, and
that is it, and every time I push to the GitHub repo, Deno Deploy will redeploy
my application. 🪄

I added these 3 lines to the top so that when I was editing the main module, I
was getting the proper intellisense with the Deno Language Server in my IDE:

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
`app.listen()`, but Deno Deploy deals with all the listening for you, so the app
only needs to handle the `FetchEvent`s, so what we do is:

```ts
addEventListener("fetch", app.fetchEventHandler());
```

This will have Deno Deploy send `FetchEvent`s into our handler, and for each
event, the middleware will be invoked and the response sent to the client.
