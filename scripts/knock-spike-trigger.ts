// SPIKE (issue #7). Usage: npx tsx scripts/knock-spike-trigger.ts <cadenceUserId>
import Knock from "@knocklabs/node";
import Database from "better-sqlite3";

process.loadEnvFile(".env");

const userId = Number(process.argv[2]);
if (!Number.isInteger(userId)) {
  console.error("Usage: npx tsx scripts/knock-spike-trigger.ts <cadenceUserId>");
  process.exit(1);
}

const user = new Database("data.db", { readonly: true })
  .prepare("select id, name, email from users where id = ?")
  .get(userId) as { id: number; name: string; email: string } | undefined;
if (!user) throw new Error(`No Cadence user with id ${userId}`);

const knock = new Knock({ apiKey: process.env.KNOCK_SECRET_API_KEY });
const workflow = process.env.KNOCK_SPIKE_WORKFLOW_KEY ?? "spike-notification";

// Inline identify: the recipient object upserts the user in Knock.
const result = await knock.workflows.trigger(workflow, {
  recipients: [{ id: String(user.id), name: user.name, email: user.email }],
  data: { message: `Spike Notification for ${user.name} at ${new Date().toISOString()}` },
});
console.log(`Triggered ${workflow} for user ${user.id}:`, result);
