// SPIKE (Spike Knock in Cadence, issue #7). Throwaway: never merged.
import { useRef, useState } from "react";
import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import type { Route } from "./+types/spike.knock";
import { getCurrentUserId } from "~/lib/session";
import { knockSpikeConfig, signKnockUserToken } from "~/lib/knock-spike.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    throw new Response("Select a user from the DevUI panel", { status: 401 });
  }
  return {
    ...knockSpikeConfig(),
    userId: String(userId),
    userToken: await signKnockUserToken(userId),
  };
}

export default function KnockSpike({ loaderData }: Route.ComponentProps) {
  const { publicApiKey, feedChannelId, userId, userToken } = loaderData;
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Knock spike</h1>
      <p className="text-sm text-muted-foreground">
        Knock user <code>{userId}</code>. Trigger with{" "}
        <code>npx tsx scripts/knock-spike-trigger.ts {userId}</code>.
      </p>
      <KnockProvider
        apiKey={publicApiKey}
        user={{ id: userId }}
        userToken={userToken}
      >
        <KnockFeedProvider feedId={feedChannelId}>
          <div className="flex items-center gap-2">
            <span>Bell:</span>
            <NotificationIconButton
              ref={buttonRef}
              onClick={() => setIsVisible(!isVisible)}
            />
            <NotificationFeedPopover
              buttonRef={buttonRef}
              isVisible={isVisible}
              onClose={() => setIsVisible(false)}
            />
          </div>
          <div className="h-96 max-w-md border">
            <NotificationFeed />
          </div>
        </KnockFeedProvider>
      </KnockProvider>
    </div>
  );
}
