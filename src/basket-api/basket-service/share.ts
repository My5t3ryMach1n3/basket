// Shares a shopper's basket by email, from the basket service.
import { BasketError, getBasket, type ServicePorts } from "./index.js";

export interface Email {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  send(email: Email): Promise<void>;
}

export type SharingPorts = ServicePorts & { emailProvider: EmailProvider };

export async function shareBasket(ports: SharingPorts, shopperId: string, to: string): Promise<void> {
  if (!/^[^@\s]+@[^@\s]+$/.test(to)) throw new BasketError(400, `${to} isn't an email address`);
  const { lines, total } = await getBasket(ports, shopperId);
  const items = lines.map((line) => `${line.quantity} × ${line.name}`);
  const body = [...items, `Total: £${(total / 100).toFixed(2)}`].join("\n");
  await ports.emailProvider.send({ to, subject: "A basket was shared with you", body });
}
