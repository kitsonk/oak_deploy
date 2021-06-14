import { createWorker } from "https://deno.land/x/dectyl@0.3.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

Deno.test({
  name: "basic helloWorld",
  async fn() {
    // Create a worker using the same script that is used with Deploy
    const helloWorld = await createWorker("./helloWorld.ts");

    await helloWorld.run(async function () {
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
