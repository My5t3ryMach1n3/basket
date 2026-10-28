import { describe, expect, it } from "vitest";
import { createApp } from "../support/app.js";

describe("#20 Fill a basket as a guest", () => {
  it("#20/AC1 keeps a guest's items in a basket for their guest session", async () => {
    const app = createApp();
    const guest = app.guest("g-1");
    expect(await guest.post("/basket/items", { sku: "mug" })).toEqual({ status: 204 });

    expect((await guest.get("/basket")).body).toMatchObject({ lines: [{ sku: "mug", quantity: 1 }] });
    expect((await app.guest("g-2").get("/basket")).body).toEqual({ lines: [], total: 0 });
  });

  it("#20/AC2 lists a guest's items with current prices and the total", async () => {
    const app = createApp();
    const guest = app.guest("g-1");
    await guest.post("/basket/items", { sku: "tea", quantity: 2 });
    app.setPrice("tea", 500);

    expect(await guest.get("/basket")).toEqual({
      status: 200,
      body: { lines: [{ sku: "tea", name: "Loose-leaf tea", price: 500, quantity: 2 }], total: 1000 },
    });
  });

  it("#20/AC3 merges the guest's items into their saved basket when they sign in", async () => {
    const app = createApp();
    await app.post("/basket/items", app.signIn("ada"), { sku: "tea" });
    const guest = app.guest("g-1");
    await guest.post("/basket/items", { sku: "tea", quantity: 2 });
    await guest.post("/basket/items", { sku: "pot" });

    expect(await guest.signIn(app.signIn("ada"))).toEqual({
      status: 200,
      body: {
        shopperId: "ada",
        items: [
          { sku: "tea", quantity: 3 },
          { sku: "pot", quantity: 1 },
        ],
      },
    });
    expect((await guest.get("/basket")).body).toEqual({ lines: [], total: 0 });
  });
});
