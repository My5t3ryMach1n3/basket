// Emails waiting to be sent, kept in Postgres: `outbox (id serial primary key, message jsonb, sent_at timestamptz)`.
// `sendPendingEmails()` runs on a schedule; an email the provider fails to take stays queued for the next run.

export interface Email {
  to: string;
  subject: string;
  body: string;
}

export interface EmailProvider {
  send(email: Email): Promise<void>;
}

// The slice of a Postgres client the outbox uses; a `pg` Pool fits it.
export interface OutboxSql {
  query<Row>(text: string, values: unknown[]): Promise<{ rows: Row[] }>;
}

export interface OutboxPorts {
  sql: OutboxSql;
}

export type SenderPorts = OutboxPorts & { emailProvider: EmailProvider };

export async function queueEmail(ports: OutboxPorts, email: Email): Promise<void> {
  await ports.sql.query("insert into outbox (message) values ($1)", [JSON.stringify(email)]);
}

// Sends every queued email and returns how many went.
export async function sendPendingEmails(ports: SenderPorts): Promise<number> {
  const { rows } = await ports.sql.query<{ id: number; message: Email }>(
    "select id, message from outbox where sent_at is null order by id",
    [],
  );
  let sent = 0;
  for (const { id, message } of rows) {
    try {
      await ports.emailProvider.send(message);
    } catch {
      continue;
    }
    await ports.sql.query("update outbox set sent_at = now() where id = $1", [id]);
    sent += 1;
  }
  return sent;
}
