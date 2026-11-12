// SPIKE (Spike Knock in Cadence, issue #7). Throwaway: never merged.
import { existsSync } from "node:fs";
import { signUserToken } from "@knocklabs/node";

if (existsSync(".env")) process.loadEnvFile(".env");

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from .env`);
  return value;
}

export function knockSpikeConfig() {
  return {
    publicApiKey: required("KNOCK_PUBLIC_API_KEY"),
    feedChannelId: required("KNOCK_FEED_CHANNEL_ID"),
  };
}

export function signKnockUserToken(userId: number) {
  return signUserToken(String(userId), {
    signingKey: required("KNOCK_SIGNING_KEY"),
    expiresInSeconds: 3600,
  });
}
