# Finance — Mobile (Expo)

React Native client for the Personal Expense Tracker. Uses the same NestJS API as the web app and shares domain types via `@finance/shared` / data layer via `@finance/client`.

## Setup

From the monorepo root:

```bash
pnpm install
pnpm shared:build
pnpm client:build
pnpm --filter @finance/mobile dev
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR code with a **dev client**.

Victory Native / Skia charts and local notifications require a development build — plain Expo Go is not enough.

## Environment

Copy `.env.example` to `.env`:

```bash
EXPO_PUBLIC_API_BASE_URL=https://personal-expense-tracker-c2p8.onrender.com/api/v1
EXPO_PUBLIC_APP_NAME=Finance
```

For local API development, point at `http://localhost:4000/api/v1` (use your machine LAN IP on a physical device).

## Features

- Dashboard, monthly pay toggles, quick-add expense
- Income / Expenses / Budgets / Savings goals CRUD
- Analytics (Victory charts), Insights, Loans
- Offline React Query cache (AsyncStorage)
- Local bill-due reminders (Settings toggle)

## EAS builds

1. Install EAS CLI: `npm i -g eas-cli`
2. Log in: `eas login`
3. Link the project: `cd apps/mobile && eas init` (writes a real `extra.eas.projectId` into `app.json`)
4. Set the API URL for the profile, e.g.:

```bash
# Android phone (APK you can sideload)
eas build --profile development --platform android

# Later internal APK without the dev-client tooling
eas build --profile preview --platform android
```

Profiles live in [`eas.json`](./eas.json):

| Profile       | Purpose                    |
| ------------- | -------------------------- |
| `development` | Dev client APK for Android |
| `preview`     | Internal APK               |
| `production`  | Play Store AAB             |

## Scripts

```bash
pnpm --filter @finance/mobile typecheck
pnpm --filter @finance/mobile test
```
