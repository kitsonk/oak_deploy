import { createWorker } from "https://deno.land/x/dectyl@0.3.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test({
  name: "basic webApp",
  async fn() {
    // Create a worker using the same script that is used with Deploy
    const webApp = await createWorker("./webApp.tsx");

    await webApp.run(async function () {
      // Send a request into the worker "mocking" whatever data required
      const [response] = await this.fetch("/");

      // Make assertions against the response
      assertEquals(
        await response.text(),
        `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Hello!</title><meta content="Example application" name="description" />\n  </head>\n  <body>\n    <div><h2>Comments</h2><div id="comments"><ul><li>Comment One</li><li>Comment Two</li></ul></div></div>\n    <script src="/bundle.js"></script>\n  </body>\n</html>`,
      );
      assertEquals([...response.headers], [[
        "content-type",
        "text/html; charset=utf-8",
      ]]);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, "OK");
    });
  },
});
