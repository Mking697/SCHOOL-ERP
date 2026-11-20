# School ERP — subscription setup package

This Docker-based package uses the enrollment mode supplied by the vendor. It is
not a native Windows EXE. Installer validation is not payment verification or a
commercial production-readiness claim; it does not enable vendor LIVE checkout.

## Enrollment mode and package integrity

- Keep the supplied files unchanged. Explicit `paymentMode` must be the exact
  string `TEST` or `LIVE`. Missing enrollment mode means legacy TEST, never LIVE.
- TEST enrollment is for simulated payments, not proof of real-money collection.
  Legacy TEST packages may omit manifest.json; a present manifest must be format 1,
  product `School ERP`, `testOnly: true`, with absent or explicit `TEST` mode.
- LIVE enrollment requires a canonical HTTPS vendor origin and a colocated
  manifest.json with numeric `formatVersion: 1`, product `School ERP`, explicit
  `paymentMode: LIVE` and boolean `testOnly: false`. HTTP loopback is only permitted
  for legacy/TEST use. Contradictory, malformed or missing LIVE metadata stops setup
  before credentials are generated or services started.
- These local files are not authoritative payment proof. The vendor checks payment
  before issuing a personalized download; editing metadata does not buy a license,
  activate LIVE collection or satisfy legal, security and deployment requirements.

## Before installing

- The supported installer workflow is a Windows workstation used as the school's
  server, with PowerShell and Docker Desktop running Linux containers. Windows
  Server OS is not supported by Docker Desktop. Linux auto-installation and a
  native EXE installer are not tested or supplied by this workflow.
- Confirm Docker's current Windows/virtualization prerequisites with your IT admin:
  https://docs.docker.com/desktop/setup/install/windows-install/
  Provide internet access for the initial image/dependency build, sufficient disk
  space and administrator-approved network access. Docker is not bundled here.
- Extract the entire ZIP. Keep school-enrollment.json beside install.ps1. That file
  contains YOUR school's server-side billing credential: do not share the ZIP, put
  it on a public website, email it broadly, or commit it to source control.
- Use a new installation folder. If .env already exists, the installer stops rather
  than replacing existing database/JWT credentials. Never delete an old database or
  volume to make installation succeed. Back up an existing installation first.

## Install

Open PowerShell in this folder and run:

    powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1

For a different port:

    powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 -AppPort 3008

The installer creates random per-install PostgreSQL/JWT secrets, imports only your
school's vendor enrollment, builds/starts Docker services and checks HTTP readiness.
It does not create a default administrator password. Open the reported /setup URL
and complete school branding and administrator setup yourself.

ConfigureOnly writes and privately verifies fresh .env configuration; it does NOT
start services, check HTTP readiness or mean installation is complete. To use it:

    powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File .\install.ps1 -ConfigureOnly

This creates .env, so do not immediately rerun the installer expecting it to overwrite
that configuration. If a build/start fails after .env creation, preserve that file
and database volumes. Inspect docker compose ps/logs and contact support; do not
rerun with freshly generated database credentials against an old volume.

`localhost` means the current device. Other computers need the school server's
actual LAN address and approved firewall access. Public domains, HTTPS, access
controls and backups require separate deployment work; publishing the default port
is not a secure public-server deployment.

## Billing and data

- Initial purchase INR9999 includes first30days. The clock begins when capture is
  verified, not when a ZIP is opened. Subsequent cycles require manual renewal;
  this integration does not automatically debit a bank account.
- Starter(up to300 students): INR2000/30days,10800/182days,20400/365days.
  Growth(301–800): INR3000/30days,16200/182days,30600/365days.
  Professional(801–1500): INR5000/30days,27000/182days,51000/365days.
  These are commercial size bands assigned for billing, not automatic student quotas.
- Student/operational data stays in your local PostgreSQL volume. Vendor billing
  stores customer-school/contact/subscription/payment metadata, not student records.
- Parent fee collections use YOUR school's own payment gateway configuration and are
  separate from software-subscription billing. Fee gateway keys are not preconfigured.
- Subscription installation does not embed the vendor's offline-license signing
  secret. Legacy offline licensing is a different mechanism and not provisioned by
  this package. Do not treat an offline-license tool as necessary for paid renewal.

## Access and operational limitations

- Download ownership belongs to the purchasing browser's private cookie, not the
  school administrator account created by /setup. Never share browser cookies.
- Keep a safe private copy of your verified download. Download ownership is bound to
  the purchasing browser's private cookie for30days; automatic email/account recovery
  is not implemented. Contact the vendor if browser access is lost.
- Production acceptance of reconciliation/webhook operations, refunds/disputes,
  strict-expiry/API-wide enforcement, distributed workers and backup/update/reboot
  procedures remains separate from installer validation. Current vendor-outage
  policy is fail-open. LIVE artifact/worker readiness, browser checkout acceptance
  and a full fresh Docker installation are separate release gates.
- Seller identity, GST/tax treatment and refund terms must be approved and published
  by the vendor before LIVE sales; this guide does not define or approve them.
- Do not use update.ps1 against school data without a verified database/upload backup
  and a separately approved release. The installer never deletes your volumes.
- Biometric hardware integration/native binaries/government reporting not delivered
  by this package must not be assumed to exist.
