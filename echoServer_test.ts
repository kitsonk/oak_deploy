import { createWorker } from "https://deno.land/x/dectyl@0.2.0/mod.ts";
import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

Deno.test({
  name: "echoServer handles json",
  async fn() {
    const echoServer = await createWorker("./echoServer.ts");
    await echoServer.run(async function () {
      const [response] = await this.fetch("/", {
        method: "POST",
        body: JSON.stringify({ hello: "world" }),
        headers: {
          "content-type": "application/json",
        },
      });

      assertEquals(
        await response.text(),
        await Deno.readTextFile("./fixtures/echoServer_json_response.html"),
      );
      assertEquals(response.status, 200);
      assertEquals(response.statusText, "OK");
    });
  },
});

Deno.test({
  name: "echoServer handles multipart bodies",
  async fn() {
    const echoServer = await createWorker("./echoServer.ts");

    (async () => {
      for await (const entry of echoServer.logs) {
        console.log(`[echoServer]: ${entry}`);
      }
    })();

    await echoServer.run(async function () {
      const body = new FormData();
      body.append("hello", "world");

      const [response] = await this.fetch("/", {
        method: "POST",
        body,
      });

      assertEquals(
        await response.text(),
        await Deno.readTextFile("./fixtures/echoServer_formdata_response.html"),
      );
      assertEquals(response.status, 200);
      assertEquals(response.statusText, "OK");
    });
  },
});
