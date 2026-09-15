# Shush Android — real call blocking

This is a standalone native Android app (Kotlin) that does the one thing
the web app can't: it actually rejects incoming calls from a user's
blocked contacts, using Android's `CallScreeningService` API.

It talks to the **same Supabase project** as the Next.js web app —
sign in with your existing Shush account and it pulls your active
`blocked_contacts` rows (the ones that have a phone number) into a local
database that the call screener checks.

> The previous `android/src/` folder is legacy scaffolding (an empty
> `MainActivity.java`, mismatched package names, no build system — it
> never compiled). This `android/app/` project replaces it. Once you've
> confirmed this one builds and runs, delete `android/src/`.

## What this does and doesn't do (today)

- ✅ **Calls**: real. `ShushCallScreeningService` runs for every incoming
  call once you grant the app the "Caller ID & spam apps" role, checks a
  local Room database, and rejects the call if the number matches an
  active blocked contact.
- ✅ **Sync**: real. `BlockSyncWorker` (WorkManager) pulls your blocked
  contacts from Supabase every 15 minutes, plus on sign-in / app resume /
  "Sync Now".
- ❌ **Texts**: intentionally not built yet. Real SMS blocking requires
  this app to become the phone's *default SMS app* (a much bigger
  project — inbox, compose, MMS) since that's the only role Android lets
  write to the system blocked-number list or intercept a message before
  the stock Messages app sees it. The old `SmsReceiver.java` in
  `android/src/` didn't actually achieve this (broadcast receivers can't
  reliably block delivery on modern Android) and was deliberately **not**
  carried forward into this project as working code it isn't — delete it
  along with the rest of `android/src/` once you've confirmed this new
  project builds. Treat SMS as a separate follow-up project.
- ⚠️ Phone number matching is deliberately simple right now (strips
  everything but digits, compares the last 10 digits — see
  `PhoneNumbers.kt`). Good enough to prove the pipeline end-to-end; swap
  in proper E.164 parsing (e.g. libphonenumber) before relying on this
  for international numbers.

## 1. Required Supabase setup

The mobile app reads `blocked_contacts` directly via Supabase's REST API
using the signed-in user's own access token — the same way the web app's
`getBlockedContacts()` does. That means **Row Level Security must already
be correctly scoped** on this table, e.g.:

```sql
alter table blocked_contacts enable row level security;

create policy "Users can read their own blocked contacts"
  on blocked_contacts for select
  using (auth.uid() = user_id);
```

If this policy (or an equivalent) isn't in place, one of two things is
true and both matter beyond just this app: either the table is wide open
(any authenticated user could read any other user's blocked contacts —
already flagged in the earlier security review) or reads are blocked
entirely and sync will silently return zero rows. Confirm this in the
Supabase dashboard (Authentication → Policies) before debugging anything
else.

The Android client also passes `user_id=eq.<the signed-in user's id>`
explicitly on every request as defense-in-depth, but that's not a
substitute for RLS — it only protects this one query, not the whole
table.

## 2. Configure

Copy `local.properties.example` to `local.properties` (already
gitignored) in this `android/` folder and fill in:

```
sdk.dir=/path/to/Android/sdk       # Android Studio adds this automatically
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Use the exact same values as the web app's `.env.local`
(`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## 3. Build & run

1. Open the `android/` folder (not the repo root) in Android Studio.
2. Let Gradle sync. If Studio complains about a missing
   `gradle-wrapper.jar`, click through its offer to regenerate the
   wrapper (or run `gradle wrapper` from this folder if you have Gradle
   installed) — the jar itself isn't checked into git.
3. Run on a **physical Android 10+ device** (recommended — role
   granting and real incoming calls are the most reliable way to verify
   this). Emulators work for the sync/UI parts; see the testing note
   below for simulating a call.
4. Sign in with your existing Shush account email/password.
5. Tap **Enable Call Blocking** and grant the role when prompted (on
   some OEM skins this routes through Settings → Apps → Default apps →
   Caller ID & spam apps rather than a plain dialog — follow whatever
   the system shows).
6. Tap **Sync Now** (or wait up to 15 minutes) — the blocked-numbers list
   on screen should populate from whatever you've blocked in the web
   app's `/block` flow.
7. Call the device from a number you've blocked. It should be rejected
   silently (no ring) and show up in Recents as blocked; Logcat
   (`adb logcat -s ShushCallScreening`) will show the screening decision.

### Testing on an emulator

Emulators don't have a SIM, but you can simulate an incoming call from
your host machine:

```
adb emu gsm call +15551234567
```

Use the same phone number format you entered when blocking the contact
in the web app.

## Next steps worth doing after this is verified

- Surface blocked-call activity back to Supabase (e.g. a
  `blocked_call_events` table written from `ShushCallScreeningService`)
  so Guardians can see it in the web dashboard — right now a blocked
  call is only visible locally (Recents/Logcat).
- Replace the naive last-10-digits matching in `PhoneNumbers.kt` with a
  real E.164 parser once international numbers matter.
- Add a proper `WorkInfo` observer in `MainActivity` for live sync
  progress instead of the current fixed 3-second UI delay.
- The default-SMS-app project for real text blocking (see above).
