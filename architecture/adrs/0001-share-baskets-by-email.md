# 0001. Share baskets through a new component and an email provider

Date: 2026-10-28

## Status

Proposed. Change to Accepted when the PR merges, or to "Superseded by NNNN" later.

## Context

#5 asks for a shopper to share their basket by email. Nothing in the approved target sends outbound messages, and the
target has no email provider. Implementing it in the basket service failed validation (no `req-5` view) and, within
the target, had nowhere to declare the call to an email provider.

## Decision

Add a **Basket sharing** component (`src/basket-api/basket-sharing`) and an external **Email provider** system. The
controller shares baskets through the new component, which reads the priced basket through the basket service and
sends it with the email provider. `req-5` shows the path.

## Alternatives considered

- Build email sending into the basket service: it would give the basket service a second job, and a dependency on an
  outside system that none of its other requirements need.
- Have the web app send the email itself: it would need the provider's credentials in the browser.

## Consequences

Sharing can change without touching the basket service. The basket API now depends on the email provider being up
when a basket is shared.
