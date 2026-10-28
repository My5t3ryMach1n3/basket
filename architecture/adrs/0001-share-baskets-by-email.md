# 0001. Share baskets through a new component and an email outbox

Date: 2026-10-28

## Status

Proposed. Change to Accepted when the PR merges, or to "Superseded by NNNN" later.

## Context

#5 asks for a shopper to share their basket by email. Nothing in the approved target sends outbound messages, and the
target has no email provider. Implementing it in the basket service failed validation (no `req-5` view) and, within
the target, had nowhere to declare the call to an email provider.

## Decision

Add a **Basket sharing** component (`src/basket-api/basket-sharing`), an **Email outbox** component
(`src/basket-api/email-outbox`) and an external **Email provider** system. The controller shares baskets through
Basket sharing, which reads the priced basket through the basket service and queues the email in the outbox. The
outbox stores it in Postgres, and a scheduled run of `sendPendingEmails()` sends what's queued; an email the provider
refuses stays queued for the next run. `req-5` shows the path, including the later send.

## Alternatives considered

- Build email sending into the basket service: it would give the basket service a second job, and a dependency on an
  outside system that none of its other requirements need.
- Have the web app send the email itself: it would need the provider's credentials in the browser.
- Send the email inline from Basket sharing, as first proposed: a slow or down provider would hold up the basket API,
  and #5/AC2 can't be met. Rejected in review.
- A message queue such as SQS: a second piece of infrastructure for one low-volume email, when Postgres is already
  there.

## Consequences

Sharing can change without touching the basket service, and a share never waits on the provider. Email is sent up to
one schedule interval late, and something has to run the sender: a scheduled task in the ECS service. Worth
revisiting if other features need outbound messages at volume.
