# Notification infrastructure vendors for Cadence

**Date read:** 2026-11-12. All pricing pages, docs and npm/GitHub data below were read on this date. Pricing changes often, so re-check before deciding.

**Question:** Which hosted notification-infrastructure vendor fits Cadence? v1 needs an in-app inbox. Email and browser (web) push come later. SMS is out of scope.

**Context:** Cadence is a server-rendered React Router 8.3.0 app (framework mode, React 19, Node, SQLite/Drizzle). It is web only, so "push" means browser web push. It is a learning project, so a generous free tier and good developer experience matter most. Self-hosting is not needed, but open source is a bonus.

**Method:** Primary sources only: vendor docs, official pricing pages, npm registry metadata (`npm view`), published package contents (`npm pack`) and GitHub repos. "Unverified" means a primary source could not confirm the fact. Vendors' "vs" pages were not used.

**Extras considered:** Engagespot's pricing page returned 404 (`engagespot.co/pricing`), so it was not evaluated. Fyno was not evaluated. No extra vendor row was added.

---

## Summary

### Comparison table

| | Knock | Novu (Cloud) | Courier | MagicBell | SuprSend |
|---|---|---|---|---|---|
| **Free tier** | 10k messages/mo, unlimited seats and environments. Next tier: Starter, $250/mo for 50k | 10k workflow runs/mo, 5 workflows, 3 seats, 2 environments, 24h activity retention. Next tier: Pro, from $30/mo for 30k | 10k sends/mo, no seat fees. Next tier: Business, $0.005/send from the first send (50k = $250) | 1k deliveries/mo, counted per channel. 1 project, unlimited users and seats. Next tier: Startup, $249/mo for 50k | 10k notifications/mo, unlimited seats. Next tier: Essentials, $100/mo for 50k. Digests and preferences need Business ($250/mo) |
| **React inbox** | `@knocklabs/react` 0.15.1, with headless hooks in `react-core` | `@novu/react` 3.19.2, with hooks at `@novu/react/hooks` | `@trycourier/courier-react` 9.3.5, a web component plus the `useCourier` hook | `@magicbell/react` 1.14.0. No hooks documented | `@suprsend/react` 1.5.0, with hooks in `@suprsend/react-core` |
| **SSR fit** | `"use client"` banner. No SSR docs. Only Next.js and TanStack adapters exist. Unverified | Package ships an SSR stub on the Node export condition, so the real UI is browser-only. Docs: "client-side only" | Docs: safe to import on the server, guarded on `typeof window`, prerenders a stub. Best documented | `"use client"` per component. No SSR docs. Unverified | `typeof window` guards in core. No SSR docs. Unverified |
| **Node SDK** | `@knocklabs/node` 1.41.1, TypeScript | `@novu/api` 3.19.1, TypeScript | `@trycourier/courier` 10.0.0, TypeScript | `magicbell-js` 1.8.0 (`/project-client`), TypeScript | `@suprsend/node-sdk` 1.15.1, ships types |
| **Email** | Yes, bring a provider. Built-in test sender: 100/mo | Yes, bring a provider | Yes. The Test environment has a sender limited to your own address | Yes | Yes |
| **Web push** | Via FCM, OneSignal or SNS. No native VAPID | Via FCM, OneSignal, Pushpad, Pusher Beams or webhook. No native VAPID | Via third-party providers (FCM, OneSignal, Pusher Beams, even MagicBell). No native VAPID | **Native VAPID** (you supply keys) and a `WebPushButton` component | **Native VAPID** with an SDK service worker |
| **Delay, batch, digest** | Delay and batch on free. No dedicated digest; recurring digests follow a documented pattern | Delay, digest and throttle on free, but delay and digest windows max out at 24h on Free | Delay, batch, digest and throttle (journeys). Pricing table shows "Digest & batching" on all plans | Only `wait` (delay). No batch or digest | Delay on free. **Batching & Digest are Business-only** |
| **Users and preferences** | Identify or inline at trigger. Preference sets cover categories, channel types and workflows, with tenant defaults. Per-tenant preferences need a paid plan | Subscribers. Workflow defaults, then global, then per-workflow per-channel preferences. Critical workflows. Tenants via context | Profiles. Subscription topics with OPTED_IN, OPTED_OUT or REQUIRED, per-topic channel routing, tenant scope. "Advanced user preferences" is Enterprise | Users by external ID or email (upsert). Channel preferences and topic subscriptions | Users by `distinct_id` (upsert), tenants. **User preferences are Business-only** |
| **Inbox auth** | Public key plus RS256 JWT signed with `signUserToken` ("enhanced security mode") | HMAC-SHA256 `subscriberHash` of the subscriber ID with the secret key. Required in prod | JWT minted by a **server API call** (`POST /auth/issue-token`) with scopes | HS256 user JWT signed with the project secret | Public key plus ES256 JWT ("enhanced security mode"), with a refresh callback |
| **Local dev and testing** | Development and production environments plus custom ones, CLI (`@knocklabs/cli` 1.6.2), sandbox mode, test runner | Dev and Prod environments, Local Studio (`npx novu dev`) with a tunnel, code-first `@novu/framework` | Test and Production environments (up to 20), draft keys, CLI (`@trycourier/cli`) | CLI (`magicbell-cli`). No test mode documented. 1 project on free | Workspaces, CLI sync. Free-tier staging unclear |
| **EU region** | **None found.** Subprocessors list USA only | **EU (Frankfurt) on all plans, including Free** | EU datacenter on Business and Enterprise only | Unverified | "EU-data residency options" per security page, but pricing lists custom regions as Enterprise-only |
| **Open source** | No (SDKs MIT) | **Yes.** Core MIT, `enterprise/` commercial. Self-hosted Community Edition via Docker, with some cloud-only features | No (SDKs MIT/Apache-2.0) | No (SDK repo license: NOASSERTION) | No. Self-hosting is Enterprise-licensed |

### Shortlist (no final pick)

1. **Novu.** It is the only vendor with all of: a free EU region, open-source self-hosting, digests on free, and a local dev studio. Trade-offs:
   - The free tier is tight: 5 workflows, 3 seats, 24h activity retention, and a 24h max digest/delay window.
   - The React Inbox is explicitly client-only. On the server it renders a stub (`dist/esm/server`), so expect a client-side pop-in.
   - Web push needs a third party (FCM, OneSignal or Pushpad).
   - HMAC auth is the simplest of the group.
2. **Knock.** It has the strongest free tier for the feature set: 10k messages, unlimited seats and environments, and batching and preferences included. It also has a mature preference model, a CLI, sandbox mode, and a built-in test email sender. Trade-offs:
   - No EU region was found.
   - Not open source.
   - Web push only via FCM or OneSignal.
   - No documented SSR guidance. The React package ships Next.js and TanStack Router adapters but none for React Router.
   - The paid jump is steep: $250/mo.
3. **Courier.** It has the best-documented SSR behaviour (prerender-safe web component), a 10k free tier, digests and batching on all plans, and pay-as-you-go pricing at $0.005/send. Trade-offs:
   - EU needs a paid plan.
   - Advanced preferences and multi-tenant accounts are Enterprise-only in the pricing table.
   - Inbox JWTs must be minted by a network call to Courier rather than signed locally.
   - Web push only via third parties.
   - Not open source.

### Weak spots and surprises

- **Native web push is rare.** Only MagicBell and SuprSend handle VAPID web push natively. They are also the two weakest on the free tier: MagicBell has 1k deliveries and no digests, and SuprSend gates digests and preferences behind $250/mo. Knock, Novu and Courier all need a third party (FCM, OneSignal or Pushpad) for browser push.
- **No vendor documents React Router framework-mode SSR.** Courier's Next.js guide explains the mechanism best (stub under Node, hydrates in the browser), and that should carry over. Novu's package switches to a stub on non-`browser` export conditions, which Vite SSR will pick on the server. Knock's React package ships framework adapters for Next.js and TanStack Router only, not React Router. All of these behaviours are **unverified** in a React Router 8 app; a spike should confirm hydration.
- **Digest gating differs widely:**
  - SuprSend: digests are Business-only ($250/mo).
  - MagicBell: no digests at all.
  - Novu: digests on free, capped at a 1-day window.
  - Knock: batching on free, but the docs say batching is not the same as daily digests.
  - Courier: all plans, per the pricing table.
- **EU data residency on free:** only Novu offers it.
- **Open source:** only Novu has a usable self-hostable open-source core.
- **Courier's pricing has no free allowance once you upgrade.** Business charges $0.005 from the first send, and Test-environment sends count against quota.
- **Courier's token endpoint can mint non-expiring tokens.** Its docs warn that omitting `expires_in` "mints a token that never expires". MagicBell's own example uses a 1-year JWT.

---

## Knock

- **Free tier ("Developer"):**
  - Limits: 10,000 messages/mo, unlimited seats, unlimited environments. Batching and preferences are included. [pricing](https://knock.app/pricing)
  - Not included on free: Knock branding removal, translations, per-tenant branding and preferences, and audit logs. Log retention is 30 days. [pricing](https://knock.app/pricing)
  - Starter costs $250/mo for 50k messages, then $0.005/message. [pricing](https://knock.app/pricing)
- **React inbox:**
  - Packages are `@knocklabs/react` (0.15.1, MIT) on top of `@knocklabs/client`. [docs](https://docs.knock.app/in-app-ui/react/overview), npm.
  - The SDK "includes a complete set of React hooks" for custom UI. [docs](https://docs.knock.app/in-app-ui/react/overview)
  - Peer deps: React 17–19. `next` and `@tanstack/react-router` are also listed as peers, for optional subpath adapters (`./next`, `./tanstack`). There is no React Router adapter. npm, package contents.
  - The bundled `dist/esm/index.mjs` starts with `"use client"`. The Next.js quick start marks the inbox file as a client component. [docs](https://docs.knock.app/getting-started/quick-start/nextjs)
  - There are no SSR or hydration docs, so React Router SSR is **unverified**.
- **Node SDK:** `@knocklabs/node` 1.41.1 (Apache-2.0, ships types), npm.
- **Email and push:**
  - Email works through providers. The built-in "Knock test" sender allows 100/mo, only to account members. [docs](https://docs.knock.app/integrations/email/knock-test)
  - Push providers are APNs, FCM, Expo, OneSignal and Amazon SNS. There is no mention of VAPID or service workers. [docs](https://docs.knock.app/integrations/push/overview)
  - Web push goes through FCM. [tutorial](https://docs.knock.app/tutorials/sending-web-push-notifications-with-fcm)
- **Workflows:**
  - The batch function supports fixed, dynamic, relative and sliding windows, up to 90 days. Rendering more than 10 activities is Enterprise-only. [docs](https://docs.knock.app/designing-workflows/batch-function)
  - The docs say batching "is not exactly the same as digesting" and recommend your own system for recurring digests. [docs](https://docs.knock.app/designing-workflows/batch-function), [tutorial](https://docs.knock.app/tutorials/building-recurring-digests)
  - A delay function exists. [docs](https://docs.knock.app/designing-workflows/delay-function)
- **Users and preferences:**
  - A `PreferenceSet` holds `categories`, `channel_types`, `channels` and `workflows`, all defaulting to true. [docs](https://docs.knock.app/preferences/overview)
  - Defaults merge in this order: recipient, then tenant, then environment. [docs](https://docs.knock.app/preferences/overview)
  - Preferences can be set inline at trigger. [docs](https://docs.knock.app/preferences/overview)
  - Tenants are first-class. [docs](https://docs.knock.app/multi-tenancy/overview)
- **Inbox auth:**
  - Uses a public key. "Enhanced security mode" requires an RS256 JWT signed with your signing key, via `signUserToken` from `@knocklabs/node`. Default lifetime is 1h. [docs](https://docs.knock.app/in-app-ui/security-and-authentication)
  - The `onUserTokenExpiring` callback handles refresh. [docs](https://docs.knock.app/in-app-ui/security-and-authentication)
  - Without enhanced security mode, a public key can act as any user. [docs](https://docs.knock.app/in-app-ui/security-and-authentication)
- **Local dev and testing:**
  - Development and production environments, plus custom environments, with commit and promote. [docs](https://docs.knock.app/version-control/environments)
  - A workflow test runner, a sandbox mode that renders messages without delivering them, and the CLI `workflow run` command. [docs](https://docs.knock.app/send-notifications/testing-workflows)
  - `@knocklabs/cli` 1.6.2 (npm).
- **EU:** No EU region was found in the docs index or the changelog. The subprocessor list shows USA only. [subprocessors](https://knock.app/legal/subprocessors) Treat as **not offered, unverified with Knock**.
- **Open source:** No. The client SDK repo `knocklabs/javascript` is MIT (GitHub API).

## Novu (Cloud)

- **Free tier:**
  - Limits: 10,000 workflow runs/mo, with no overage on Free. 5 workflows, 2 environments, unlimited subscribers, 3 seats, 24h activity-feed retention. [pricing](https://novu.co/pricing)
  - The pricing page shows a 24h delay and digest window on Free (table hard to parse); the digest docs confirm a 1-day max digest window on Free. [pricing](https://novu.co/pricing), [docs](https://docs.novu.co/platform/workflow/add-and-configure-steps/configure-action-steps/digest.md)
  - Pro starts at $30/mo for 30k runs, then $1.20 per 1k. Pro adds branding removal and 7-day retention. [pricing](https://novu.co/pricing)
- **React inbox:**
  - Packages: `@novu/react` 3.19.2 (ISC, peer React 18/19), with hooks exported from `@novu/react/hooks` (`useNotifications`, `useCounts`, `usePreferences`). npm, package contents. There is also a `@novu/nextjs` package. [docs](https://docs.novu.co/.mintlify/skills/inbox-integration/references/nextjs-inbox-examples.md)
  - Docs: "The Inbox component is client-side only." [docs](https://docs.novu.co/.mintlify/skills/inbox-integration/references/nextjs-inbox-examples.md)
  - The package `exports["."]` resolves the `browser` condition to the real UI. Otherwise it resolves to `dist/esm/server`, whose source comment says the components are exported "as empty functions to fix build errors in SSR". So under SSR you get a placeholder that the client hydrates. Behaviour in React Router/Vite SSR is **unverified**.
  - Headless examples exist. [docs](https://docs.novu.co/.mintlify/skills/inbox-integration/references/headless-inbox-examples.md)
- **Node SDK:** `@novu/api` 3.19.1 (TypeScript, generated SDK, repo `novuhq/novu-ts`). The old `@novu/node` was last published 2025-12. npm, [docs](https://docs.novu.co/.mintlify/skills/manage-subscribers/references/subscriber-crud-examples.md)
- **Email and push:**
  - Push providers are FCM, Expo, APNs, OneSignal, Push Webhook, Pusher Beams and Pushpad. VAPID is not documented. [docs](https://docs.novu.co/platform/integrations/push.md)
  - Web push via Pushpad needs a Pushpad account. [docs](https://docs.novu.co/platform/integrations/push/pushpad.md)
- **Workflows:**
  - Digest has a regular mode (including "when events repeat") and a scheduled mode (hourly, daily, weekly or monthly) in the subscriber's timezone. Max window: Free 1 day, Pro 7 days, Team 30 days. [docs](https://docs.novu.co/platform/workflow/add-and-configure-steps/configure-action-steps/digest.md)
  - Delay and throttle steps exist. [docs](https://docs.novu.co/.mintlify/skills/dashboard-workflows/references/throttle-step.md)
- **Users and preferences:**
  - Subscribers are modelled explicitly (CRUD via `@novu/api`). [docs](https://docs.novu.co/.mintlify/skills/manage-subscribers/references/subscriber-crud-examples.md) Upsert-at-trigger is **unverified**.
  - Preference resolution is workflow defaults, then subscriber global, then subscriber per-workflow, all per channel. "Critical" workflows bypass subscriber preferences. Preferences are stored per subscriber and tenant when a context is set. [docs](https://docs.novu.co/platform/concepts/preferences.md)
  - Tenants and contexts are supported. [docs](https://docs.novu.co/platform/concepts/contexts.md)
- **Inbox auth:**
  - `applicationIdentifier` (public) plus `subscriberId` plus `subscriberHash`, where the hash is HMAC-SHA256 of the subscriber ID with `NOVU_SECRET_KEY`, as hex. [docs](https://docs.novu.co/.mintlify/skills/inbox-integration/references/security.md)
  - The docs say HMAC is required in production. [docs](https://docs.novu.co/.mintlify/skills/inbox-integration/references/security.md)
  - The hash does not expire. That is an inference, since it is a static HMAC of the ID.
- **Local dev and testing:**
  - Development and Production environments, with publishing from Development. Custom environments are Team and Enterprise only. [docs](https://docs.novu.co/platform/developer/environments.md)
  - Local Studio via `npx novu@latest dev` at `localhost:2022` previews and test-triggers code-defined workflows (`@novu/framework` 2.14.0) through a `*.novu.sh` tunnel. [docs](https://docs.novu.co/.mintlify/skills/framework-integration/references/studio-and-cli.md)
- **EU:** US (Virginia) and EU (Frankfurt) are on "All plans". The EU API is at `eu.api.novu.co`. API keys are bound to the region where the account was created. [docs](https://docs.novu.co/platform/additional-resources/security.md) Free EU is also listed on [pricing](https://novu.co/pricing).
- **Open source:**
  - The core is MIT and the `enterprise` folder is under a commercial license. 40.3k stars. [GitHub](https://github.com/novuhq/novu)
  - The self-hosted Community Edition runs via Docker. Some features, including some Inbox features, SSO and RBAC, are cloud-only. [docs](https://docs.novu.co/community/self-hosting-novu/overview.md)

## Courier

- **Free tier ("Developer"):**
  - 10,000 sends/mo, where one send is one template to one recipient. Test and custom environments count toward the quota. No per-seat fees. [pricing](https://www.courier.com/pricing)
  - Business is $0.005/send from the first send, pay-as-you-go. [pricing](https://www.courier.com/pricing)
  - In the comparison table (read from page HTML check icons):
    - All three plans: "Digest & batching" and "Test environment".
    - Business and Enterprise: "EU Datacenter".
    - Enterprise only: "Advanced user preferences" and "Multi-tenant accounts".
    [pricing](https://www.courier.com/pricing)
- **React inbox:**
  - Package: `@trycourier/courier-react` 9.3.5 (MIT, peer React ≥18). npm.
  - The inbox is a custom element. Element registration is "guarded on `typeof window`", so importing on the server is safe and the page prerenders. `next/dynamic` with `ssr:false` is not needed. Dev double-effects can sign the user out, so guard `signIn` with a ref. [docs](https://www.courier.com/docs/guides/add-an-inbox-to-nextjs.md)
  - The `useCourier` hook is documented. [docs](https://www.courier.com/docs/sdk-libraries/courier-react-web.md)
- **Node SDK:** `@trycourier/courier` 10.0.0 (Apache-2.0, TypeScript), npm.
- **Email and push:**
  - Email works through providers. The Test environment includes a test email provider that only delivers to your sign-up address. [docs](https://www.courier.com/docs/workspaces/environments.md)
  - Push goes only through connected third parties: APNs, FCM, Expo, OneSignal, Airship, SNS, Pusher Beams, MagicBell and others. No native VAPID. [docs](https://www.courier.com/docs/integrations/push/overview.md)
- **Workflows:**
  - Batch node: up to 1000 items, a 1-minute to 1-day wait, and a max wait of 7 days. [docs](https://www.courier.com/docs/journeys/nodes/batch.md)
  - Digest node: requires a subscription topic, and the schedule lives on the topic. [docs](https://www.courier.com/docs/journeys/nodes/digest.md)
  - Delay and throttle nodes exist. [docs](https://www.courier.com/docs/journeys/nodes/delay.md)
- **Users and preferences:**
  - User profiles. [docs](https://www.courier.com/docs/recipients/overview.md)
  - Subscription topics (`pt_`) in sections, with defaults OPTED_IN, OPTED_OUT or REQUIRED. Each topic has per-user channel routing (email, inbox, push and so on). Topics can be scoped with an optional `tenant_id`. [docs](https://www.courier.com/docs/recipients/preferences/model.md)
- **Inbox auth:**
  - The backend calls `POST /auth/issue-token` (`client.auth.issueToken()`) with scopes such as `user_id:<id> inbox:read:messages inbox:write:events`. [docs](https://www.courier.com/docs/in-app/authenticate-users.md)
  - Omitting `expires_in` "mints a token that never expires". The SDK does not auto-refresh. [docs](https://www.courier.com/docs/in-app/authenticate-users.md)
- **Local dev and testing:**
  - Test and Production environments, up to 20 environments. Draft keys (`dk_`) render unpublished templates. "No separate test mode: a Test key is what puts you in the Test environment." [docs](https://www.courier.com/docs/workspaces/environments.md)
  - CLI: `@trycourier/cli`. [docs](https://www.courier.com/docs/resources/cli.md)
- **EU:** The EU datacenter is "available on every paid plan: Business and Enterprise". [docs](https://www.courier.com/docs/workspaces/datacenters.md) It needs `api.eu.courier.com` and EU `apiUrls` in the client. [docs](https://www.courier.com/docs/in-app/authenticate-users.md)
- **Open source:** No. `trycourier/courier-web` is MIT (GitHub API).

## MagicBell

- **Free tier ("Builder"):**
  - 1,000 deliveries/mo. A delivery is counted per channel: 100 users on in-app plus 50 on email counts as 150. Unlimited users and team members, 1 project. [pricing](https://www.magicbell.com/pricing)
  - Startup is $249/mo for 50k deliveries, then $0.0025 each. [pricing](https://www.magicbell.com/pricing)
  - Feature gating per plan is not listed on the pricing page.
- **React inbox:**
  - Package: `@magicbell/react` 1.14.0, with `Provider`, `Inbox`, `FloatingInbox`, `UserPreferences` and `WebPushButton`. No hooks are documented. [docs](https://www.magicbell.com/docs/libraries/magicbell-react)
  - Component files carry `"use client"` (package contents). There are no SSR docs, so behaviour is **unverified**.
  - The legacy `@magicbell/react-headless` package still exists on npm, at 5.5.1.
- **Node SDK:** `magicbell-js` 1.8.0, with `./project-client`, `./user-client` and `./realtime` exports. npm.
- **Email and push:**
  - Email channel. [docs](https://www.magicbell.com/docs/channels/email)
  - Web push is native VAPID: you store a VAPID key pair in MagicBell and save each `PushSubscription.endpoint` as a channel token. [docs](https://www.magicbell.com/docs/channels/web_push)
- **Workflows:** Commands are `broadcast`, `wait`, `pause` and `abort` ("More commands coming soon"). No batch or digest. [workflows](https://www.magicbell.com/workflows)
- **Users and preferences:** Users are identified by `external_id` or email, with upsert. There are channel preferences and topic subscriptions. [docs](https://www.magicbell.com/docs/primitive/user)
- **Inbox auth:** An HS256 user JWT signed with the project secret key, carrying `user_external_id` or `user_email` plus `api_key`. The docs example uses a 1-year expiry. [docs](https://www.magicbell.com/docs/api/authentication/user)
- **Local dev and testing:** `magicbell-cli` manages broadcasts, users, channels and workflows. No local or test mode is documented. [docs](https://www.magicbell.com/docs/libraries/magicbell-cli) Free gives 1 project, so a separate dev project is not possible on free.
- **EU:** **Unverified.** Nothing was found on magicbell.com.
- **Open source:** No. The repo `magicbell/magicbell-js` reports license NOASSERTION (GitHub API).

## SuprSend

- **Free tier:**
  - 10,000 notifications/mo, unlimited team members, all channels. The in-app feed carries SuprSend branding. [pricing](https://www.suprsend.com/pricing)
  - **Batching & Digest and User Preferences are listed under Business**, at $250/mo for 50k, then $5 per 1k. [pricing](https://www.suprsend.com/pricing) (confirmed in page HTML)
  - Essentials is $100/mo for 50k. It removes branding and adds timezone sending. [pricing](https://www.suprsend.com/pricing)
- **React inbox:**
  - Packages: `@suprsend/react` 1.5.0 on top of `@suprsend/react-core` (MIT). Hooks include `useSuprSendClient` and `useAuthenticateUser`. [docs](https://docs.suprsend.com/docs/react-sdk.md)
  - No SSR docs. The core bundle contains `typeof window` guards (package contents). **Unverified.**
  - The older `@suprsend/react-inbox` 3.9.0 also exists on npm.
- **Node SDK:** `@suprsend/node-sdk` 1.15.1 (MIT, ships `types/index.d.ts`). [docs](https://docs.suprsend.com/docs/integrate-node-sdk.md), npm.
- **Web push:** Native VAPID. The VAPID key comes from the dashboard, and you host a `serviceworker.js` that loads SuprSend's worker script from jsDelivr. [docs](https://docs.suprsend.com/docs/js-webpush.md)
- **Workflows:** Delay, batch and digest nodes exist. [delay](https://docs.suprsend.com/reference/workflow-nodes/delay.md), [batch](https://docs.suprsend.com/reference/workflow-nodes/batch.md) Batch and digest are paid-only (see pricing).
- **Users and preferences:** Users are upserted by `distinct_id`. [docs](https://docs.suprsend.com/reference/create-update-users.md) Tenants are supported. [docs](https://docs.suprsend.com/docs/guides/multi-tenant-modelling.md) There is a preference guide. [docs](https://docs.suprsend.com/docs/guides/preference-guide.md)
- **Inbox auth:** A public key plus an ES256 user JWT (`entity_type: subscriber`, `entity_id`, `exp`, optional `scope.tenant_id`), enforced in "enhanced security mode". The client `identify` call takes a `refreshUserToken` callback. [docs](https://docs.suprsend.com/docs/client-authentication.md)
- **Local dev and testing:** Workspaces, with a CLI to sync assets between them. [docs](https://docs.suprsend.com/reference/cli-sync.md) Whether multiple environments are on free is unclear on the pricing page.
- **EU:** The security page says "We support EU-data residency options". [docs](https://docs.suprsend.com/docs/security.md) Pricing lists "Custom Data Center Region" as Enterprise-only. [pricing](https://www.suprsend.com/pricing) Free EU is **unverified / likely no**.
- **Open source:** No. Self-hosting "is supported under the Enterprise plan and is enabled via an enterprise license". [docs](https://docs.suprsend.com/docs/self-hosted/introduction.md)

---

## Sources (all accessed 2026-11-12)

- Knock: https://knock.app/pricing · https://docs.knock.app/in-app-ui/react/overview · https://docs.knock.app/in-app-ui/security-and-authentication · https://docs.knock.app/getting-started/quick-start/nextjs · https://docs.knock.app/integrations/push/overview · https://docs.knock.app/tutorials/sending-web-push-notifications-with-fcm · https://docs.knock.app/designing-workflows/batch-function · https://docs.knock.app/preferences/overview · https://docs.knock.app/version-control/environments · https://docs.knock.app/send-notifications/testing-workflows · https://docs.knock.app/integrations/email/knock-test · https://knock.app/legal/subprocessors · https://knock.app/changelog · https://docs.knock.app/llms.txt
- Novu: https://novu.co/pricing · https://docs.novu.co/platform/additional-resources/security.md · https://docs.novu.co/platform/integrations/push.md · https://docs.novu.co/platform/integrations/push/pushpad.md · https://docs.novu.co/platform/workflow/add-and-configure-steps/configure-action-steps/digest.md · https://docs.novu.co/platform/developer/environments.md · https://docs.novu.co/platform/concepts/preferences.md · https://docs.novu.co/.mintlify/skills/inbox-integration/references/security.md · https://docs.novu.co/.mintlify/skills/inbox-integration/references/nextjs-inbox-examples.md · https://docs.novu.co/.mintlify/skills/framework-integration/references/studio-and-cli.md · https://docs.novu.co/.mintlify/skills/manage-subscribers/references/subscriber-crud-examples.md · https://docs.novu.co/community/self-hosting-novu/overview.md · https://github.com/novuhq/novu
- Courier: https://www.courier.com/pricing · https://www.courier.com/docs/in-app/authenticate-users.md · https://www.courier.com/docs/guides/add-an-inbox-to-nextjs.md · https://www.courier.com/docs/integrations/push/overview.md · https://www.courier.com/docs/workspaces/datacenters.md · https://www.courier.com/docs/workspaces/environments.md · https://www.courier.com/docs/journeys/nodes/batch.md · https://www.courier.com/docs/journeys/nodes/digest.md · https://www.courier.com/docs/recipients/preferences/model.md · https://www.courier.com/docs/resources/cli.md
- MagicBell: https://www.magicbell.com/pricing · https://www.magicbell.com/docs/libraries/magicbell-react · https://www.magicbell.com/docs/api/authentication/user · https://www.magicbell.com/docs/channels/web_push · https://www.magicbell.com/docs/primitive/user · https://www.magicbell.com/docs/libraries/magicbell-cli · https://www.magicbell.com/workflows
- SuprSend: https://www.suprsend.com/pricing · https://docs.suprsend.com/docs/react-sdk.md · https://docs.suprsend.com/docs/client-authentication.md · https://docs.suprsend.com/docs/js-webpush.md · https://docs.suprsend.com/docs/integrate-node-sdk.md · https://docs.suprsend.com/docs/security.md · https://docs.suprsend.com/docs/self-hosted/introduction.md · https://docs.suprsend.com/llms.txt
- npm registry (`npm view` / `npm pack`, 2026-11-12): `@knocklabs/node` 1.41.1, `@knocklabs/react` 0.15.1, `@knocklabs/cli` 1.6.2, `@novu/api` 3.19.1, `@novu/react` 3.19.2, `@novu/framework` 2.14.0, `@trycourier/courier` 10.0.0, `@trycourier/courier-react` 9.3.5, `magicbell-js` 1.8.0, `@magicbell/react` 1.14.0, `@suprsend/node-sdk` 1.15.1, `@suprsend/react` 1.5.0
- GitHub API (licenses): knocklabs/javascript (MIT), novuhq/novu (NOASSERTION, MIT core per README), trycourier/courier-web (MIT), magicbell/magicbell-js (NOASSERTION), suprsend/suprsend-react-sdk (MIT)
- Not evaluated: Engagespot (https://engagespot.co/pricing returned 404), Fyno
