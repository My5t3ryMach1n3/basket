# 0002. Keep guest baskets in Postgres and merge them in session restore

Date: 2026-11-11

## Status

Proposed. Change to Accepted when the PR merges, or to "Superseded by NNNN" later.

## Context

#20 lets shoppers fill a basket before signing in, and merges it into their saved basket when they do. The target
had no notion of a guest, and session restore only loaded a saved basket.

## Decision

A guest basket is an ordinary saved basket keyed by the guest session, so the basket controller, service and
repository handle it unchanged. Session restore gains the merge: on sign-in with a guest session it loads both
baskets, merges the guest's items into the shopper's, and saves the result, so its relationship to the repository now
saves as well as loads. `req-20` shows both halves.

## Alternatives considered

- Keep guest baskets in the browser and send them on sign-in: the basket would be lost across devices and the merge
  rules would live in the web app.
- A separate guest basket component: it would duplicate the basket service for one difference, the key.

## Consequences

No new elements or infrastructure. Session restore now writes, so a failed merge must leave both baskets intact.
