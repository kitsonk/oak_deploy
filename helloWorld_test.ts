import { createWorker } from "https://deno.land/x/dectyl@0.1.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

Deno.test({
  name: "basic helloWorld",
  async fn() {
    // Create a worker using the same script that is used with Deploy
    const helloWorld = await createWorker("./helloWorld.ts");
    await helloWorld.start();

    // Send a request into the worker "mocking" whatever data required
    const [response] = await helloWorld.fetch("/");

    // If our assertions fail, the worker won't terminate, so the test will
    // "hang", so we need to do a try...finally
    try {
      // Make assertions against the response
      assertEquals(await response.text(), "Hello world!");
      assertEquals([...response.headers], [[
        "content-type",
        "text/plain; charset=utf-8",
      ]]);
      assertEquals(response.status, 200);
      assertEquals(response.statusText, "OK");
    } finally {
      // Close the worker...
      await helloWorld.close();
    }
  },
});
