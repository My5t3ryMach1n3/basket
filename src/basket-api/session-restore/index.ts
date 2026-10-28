// Hands a shopper back their saved basket when they sign in again after their session expired, merging in anything
// they added as a guest first. The new sign-in goes through the auth middleware like every other request, never
// straight to the identity provider.
import { authenticate, type AuthPorts } from "../auth-middleware/index.js";
import { loadBasket, saveBasket, type RepositoryPorts, type SavedBasket } from "../basket-repository/index.js";

export type RestorePorts = AuthPorts & RepositoryPorts;

export async function restoreSession(
  ports: RestorePorts,
  authorization: string | undefined,
  // The basket the shopper filled as a guest, if they did.
  guestBasketId?: string,
): Promise<SavedBasket> {
  const shopperId = await authenticate(ports, authorization);
  const saved = await loadBasket(ports, shopperId);
  if (guestBasketId === undefined) return saved;
  const guest = await loadBasket(ports, guestBasketId);
  if (guest.items.length === 0) return saved;
  for (const { sku, quantity } of guest.items) {
    const item = saved.items.find((candidate) => candidate.sku === sku);
    if (item === undefined) saved.items.push({ sku, quantity });
    else item.quantity += quantity;
  }
  await saveBasket(ports, saved);
  // Emptied, so signing in again with the same guest basket doesn't add its items twice.
  await saveBasket(ports, { shopperId: guest.shopperId, items: [] });
  return saved;
}
