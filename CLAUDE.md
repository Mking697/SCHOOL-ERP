# School ERP handoff

## October 15, 2026 — explicitly resumed; local TEST acceptance passed

Latest evidence and next gates: ../vendor-server/RESUME-ACCEPTANCE-2026-10-15.md. This supersedes October 14 pending automatic-unlock/stopped-QA statements, not the preserved historical evidence below.

- Recovered late lifecycle review; fixed schoolName-replacement disabled controls using keyed child state and three RED/GREEN regressions. Parent reran 71 vendor + 24 school named tests, both typechecks/focused lint/builds successfully.
- NEW QA school cmv94mgj10000d4f2hna5cmr8: actual Razorpay TEST cancel/decline left expired/unpaid; successful checkout auto-reloaded/unlocked dashboard WITHOUT server restart. Real provider captured/paid, one INR 5000 ledger row and expiry 2026-11-14T06:08:07.915Z read back. Replay 200 with no extra extension; cross-school/tampered signature 400. Previous paid fixtures preserved.
- Independent settled cache/lifecycle review deleg_5d589ce7 PASSED; parent incorporated verdict. No concrete security/logic findings. Reviewer reported 20 focused checkout/cache tests passing. Approval is scoped, not whole-system or deployment acceptance.
- QA listeners running: vendor 3004/PID20132 and school 3005/PID20332, unchanged across payment; DB containers/data preserved. Background tracking logs unreliable (stdin-is-not-a-tty); actual CIM/listener/HTTP verified.
- Production untouched; no commit/push/deployment/migration/live-money collection. Obtain explicit TEST-only release authorization and backup/restore/rollback/new-log gates before VPS changes. Both school-side fixes and vendor integration remain local.

## Historical checkpoints (superseded where noted)


## PAUSED October 14, 2026 — resume only on explicit request

Read the LATEST pause checkpoint in ../CLAUDE.md and ../calude.md, then ../vendor-server/RAZORPAY-INTEGRATION-CHECKPOINT.md. Preserve all local uncommitted code/tests; do not redo completed backend/admin provisioning or deploy merely from reading this file.

Latest parent evidence: 71 vendor tests and 21 school tests; builds/typecheck/focused lint passed. Actual TEST captures persisted, no real money. Lifecycle disposal fix implemented; final review verdict not incorporated. Shared positive/no-negative cache fix passed regressions/build, but final automatic dashboard-unlock browser assertion was interrupted and is still pending. New integration is NOT deployed to VPS.

QA app ports 3004/3005 stopped; vendor QA DB container stopped with data retained. Original school DB/container left untouched. Exact fixtures, commands, boundaries and tomorrow's ordered gates are in root handoff. No passwords/API secrets in docs/Git.

## Earlier checkpoint/history

Work paused October 12, 2026 at the user's request. Resume only after explicit user instruction.

Read ../calude.md for the complete saved handoff and ../vendor-server/DEPLOYMENT-CHECKPOINT.md for the live vendor deployment status. Do not infer pending tasks from older README completion claims.

School HEAD at pause: 4205701; working tree clean before adding this entry file. School data remains on each school's server. Vendor app is a separate sibling repository; it is not included in this app's GitHub remote.

October 14, 2026: permanent Developer/Vendor Admin nantultiwari697@gmail.com was securely provisioned and live login/dashboard/API/logout verified. Next task belongs to vendor-server: Razorpay setup and payment security/acceptance, still pending. Do not modify school production data or existing VPS apps. Local school app now uses a NEW isolated school_erp_local database (Docker school-erp-local-g-school, loopback port 5434) and localhost:3000/setup; old school QA records are not present here.
