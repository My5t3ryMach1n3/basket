// Shares a shopper's basket by email. The email is queued in the outbox, never sent inline, so a slow or failing
// email provider can't hold up the basket API.
import { BasketError, getBasket, type ServicePorts } from "../basket-service/index.js";
import { queueEmail, type OutboxPorts } from "../email-outbox/index.js";

export type SharingPorts = ServicePorts & OutboxPorts;

export async function shareBasket(ports: SharingPorts, shopperId: string, to: string): Promise<void> {
  if (!/^[^@\s]+@[^@\s]+$/.test(to)) throw new BasketError(400, `${to} isn't an email address`);
  const { lines, total } = await getBasket(ports, shopperId);
  const items = lines.map((line) => `${line.quantity} × ${line.name}`);
  const body = [...items, `Total: £${(total / 100).toFixed(2)}`].join("\n");
  await queueEmail(ports, { to, subject: "A basket was shared with you", body });
}
