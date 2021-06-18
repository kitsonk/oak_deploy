import { createWorker } from "https://deno.land/x/dectyl@0.3.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test({
  name: "basic static",
  async fn() {
    // Create a worker using the same script that is used with Deploy
    const staticServer = await createWorker("./static.ts", {
      name: "staticServer",
    });

    (async () => {
      for await (const entry of staticServer.logs) {
        console.log(`[${staticServer.name}]: ${entry}`);
      }
    })();

    await staticServer.run(async function () {
      // Send a request into the worker "mocking" whatever data required
      const [response] = await this.fetch("/");

      // Make assertions against the response
      assertEquals(await response.text(), "Hello world!");
      assertEquals([...response.headers], [[
        "content-type",
        "text/plain; charset=utf-8",
      ]]);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, "OK");
    });
  },
});
