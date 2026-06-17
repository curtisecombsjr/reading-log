# reading-log-app

**Vault note:** `~/Projects/vault/projects/android/reading-log-app/index.md`
**Changelog:** `~/Projects/vault/projects/android/reading-log-app/changelog.md`

## Execution context

- **Source of truth:** this machine (`~/Projects/android/reading-log-app/`)
- **Run commands:** locally

(Edit if the project lives elsewhere — e.g. SSH to another host.)

## After any source change, build the APK

This ships as a sideloaded APK (Capacitor, appId `com.readinglog.app`). Curtis installs **`reading-log.apk`**, so after editing anything under `src/` build the full APK — don't stop at `npm run build`.

```bash
cd ~/Projects/android/reading-log-app
npm run build                                                         # vite → dist/
npx cap sync android                                                  # dist/ → android assets
cd android && env -u ANDROID_SDK_ROOT JAVA_HOME=/usr/lib/jvm/zulu-21 \
  ANDROID_HOME=/home/psynophile/Android/Sdk ./gradlew assembleDebug   # → app-debug.apk
cd app/build/outputs/apk/debug && cp app-debug.apk reading-log.apk    # MANDATORY rename
```

**Output Curtis installs:** `android/app/build/outputs/apk/debug/reading-log.apk`

**Gotcha — the rename is MANDATORY, not convenience.** Gradle only writes `app-debug.apk`; Curtis sideloads `reading-log.apk` (copy in the same dir). Skip the `cp` and he installs a stale build and the change "doesn't show up." Always `cp` and verify the timestamp updated. (Same trap that burned [[iron-log]] on 2026-06-17 — see [[apk-build]], [[save-actionable-memories]].)

**Gotcha — two Android SDKs are set.** `ANDROID_HOME=/home/psynophile/Android/Sdk` and `ANDROID_SDK_ROOT=/opt/android-sdk` both exist and differ; gradle aborts with "Several environment variables… contain different paths to the SDK." Fix: build with `env -u ANDROID_SDK_ROOT` and an explicit `ANDROID_HOME` (as above). Don't try to reconcile the two globally — just scope it to the gradle call.

**Gotcha — JDK 21 required.** Capacitor 8 targets Java 21; system default is JDK 17. Pass `JAVA_HOME=/usr/lib/jvm/zulu-21` or the build fails with `invalid source release: 21`.

Tell Curtis the final path (`…/debug/reading-log.apk`) when done.

## Before ending a session

If you modified anything in this project, append a one-line entry to the changelog:
`YYYY-MM-DD — what changed and why.`

## Workspace rules

See `~/Projects/CLAUDE.md` for workspace-wide conventions (no committed passwords, kebab-case names, vault is canonical memory, etc.).
