import { describe, expect, it } from "vitest";
import { createApp } from "../support/app.js";

describe("#5 Share the basket by email", () => {
  it("#5/AC1 sends the basket's items to the address it's shared with", async () => {
    const app = createApp();
    const token = app.signIn("ada");
    await app.post("/basket/items", token, { sku: "mug", quantity: 2 });

    expect(await app.post("/basket/share", token, { to: "grace@example.com" })).toEqual({ status: 202 });
    await app.sendPendingEmails();
    expect(app.sentEmails).toEqual([
      expect.objectContaining({ to: "grace@example.com", body: expect.stringContaining("2 × Enamel mug") }),
    ]);
  });

  it("#5/AC2 accepts the share straight away while the email provider is down, and sends it later", async () => {
    const app = createApp();
    const token = app.signIn("ada");
    await app.post("/basket/items", token, { sku: "tea" });
    app.setEmailProviderDown(true);

    expect(await app.post("/basket/share", token, { to: "grace@example.com" })).toEqual({ status: 202 });
    await app.sendPendingEmails();
    expect(app.sentEmails).toEqual([]);

    app.setEmailProviderDown(false);
    await app.sendPendingEmails();
    expect(app.sentEmails).toEqual([expect.objectContaining({ to: "grace@example.com" })]);
  });
});
