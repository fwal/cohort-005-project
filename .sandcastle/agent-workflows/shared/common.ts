import * as fs from "node:fs";
import * as path from "node:path";
import * as sandcastle from "@ai-hero/sandcastle";

export const outputDir = (): string => process.env.OUTPUT_DIR ?? "/tmp";

export const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
};

export const writeJson = (filename: string, value: unknown): void => {
  fs.mkdirSync(outputDir(), { recursive: true });
  fs.writeFileSync(
    path.join(outputDir(), filename),
    JSON.stringify(value, null, 2)
  );
};

// The one agent every factory workflow runs: Codex, billed to an OpenAI API
// key. The workflows hold that key in the OPENAI_API_KEY secret.
//
// `codex exec` does not read OPENAI_API_KEY: started without a login it sends
// no credentials at all, and fails with "failed to connect to Responses
// WebSocket" (a 401 underneath). It reads CODEX_API_KEY, so the key is passed
// on under that name.
//
// Sandcastle runs every agent with its permission checks skipped, so it can
// use any tool.
export const claudeAgent = () =>
  sandcastle.codex("gpt-6.1-sol", {
    env: {
      CODEX_API_KEY: required("OPENAI_API_KEY"),
    },
  });
