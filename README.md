# School ERP

On-premise, self-hosted School Management ERP. Each school installs this on
its own Windows server — the installer sets up the database automatically,
no manual DB/server configuration needed.

## For school IT staff: how to install

1. Install Docker Desktop (if not already): https://www.docker.com/products/docker-desktop/
2. Copy this whole folder to the server.
3. Right-click `install.ps1` -> Run with PowerShell (or open PowerShell here and
   run `./install.ps1`).
4. Answer the questions it asks (school name, admin login, port).
5. Open `http://<server-ip>:<port>` in a browser and log in.

That's it -- the database, tables, and your admin account are created
automatically. Nothing to configure by hand.

## To update later

Run `./update.ps1` -- pulls/rebuilds and re-applies migrations automatically.

## For developers

- Stack: Next.js 16 (App Router) + TypeScript + Prisma 7 + PostgreSQL + Tailwind.
- Local dev: copy `.env.example` to `.env`, point PGHOST/PGUSER/PGPASSWORD/PGDATABASE
  at a local Postgres, then:
  ```
  npm install
  npx prisma migrate dev
  npx prisma db seed
  npm run dev
  ```
- IMPORTANT: there is no single `DATABASE_URL` stored in any file. Some Windows
  endpoint security tools (seen with Avast on this project) silently redact
  `scheme://user:pass@host` shaped text to `***` when written to disk, which
  would corrupt the DB password. Instead the connection string is built in
  memory at runtime from separate `PGHOST`/`PGUSER`/`PGPASSWORD`/`PGPORT`/
  `PGDATABASE` env vars (see `prisma.config.ts` and `src/lib/db.ts`).
  `install.ps1` verifies the password actually landed on disk before
  proceeding and fails loudly if it got redacted.
- Prisma Client is generated to `src/generated/prisma` (not `node_modules`) --
  Prisma 7 requirement. Run `npx prisma generate` after pulling schema changes.
- Auth middleware lives in `src/proxy.ts` (Next.js 16 renamed `middleware.ts`
  to `proxy.ts`).
- See `../PLAN.md` (one level up) for the full module roadmap and phases.

## Current status (Phase 0 + Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 done)

Phase 0 -- Foundation:
- Next.js + TS + Tailwind + Prisma scaffold
- Docker Compose self-host stack (app + Postgres + auto-migrate/seed)
- install.ps1 / update.ps1 for Windows
- Basic auth (login, session cookie, route protection) + Super Admin seed
- Core schema: School, License (stub), User/Role, ClassLevel, Section,
  Teacher, Parent, Student, Attendance

Phase 1 -- Student Information System:
- Classes & Sections management (/classes)
- Student admission form (/students/new) with auto-generated admission number
- Student list with search (/students)
- Student detail view (/students/[id])
- Printable Student ID Card (/students/[id]/id-card)
- Admission Enquiries tracking (/enquiries) with status (NEW/FOLLOW_UP/ADMITTED/CLOSED)

Phase 2 -- Attendance, Timetable, Holidays:
- Daily attendance marking per section/date (/attendance) with bulk "mark all present"
- Subjects + weekly timetable grid per section (/timetable)
- Holidays & School Planner (/holidays)

Phase 3 -- Fee Management:
- Fee Heads + per-class Fee Structure setup (/fees/structure)
- Bulk invoice generation for a whole section (/fees/generate)
- Invoice list with status filters (/fees)
- Invoice detail / printable receipt, cash/bank/cheque payment recording,
  and a Razorpay "Pay Online" button scaffold (/fees/[id]) -- needs real
  RAZORPAY_KEY_ID/SECRET to actually test the online payment flow

Phase 4 -- Academics & Exams:
- Homework/Assignment assignment per section+subject with due dates (/homework)
- Exam creation with multiple subjects + max marks per class (/exams)
- Per-subject marks entry grid for all students in a class (/exams/[id])
- Printable Report Card with auto-calculated grade (A+/A/B+/B/C/D/F) per
  subject and overall percentage (/exams/[id]/report-card/[studentId])

Next (Phase 5): Staff/HR (Employee, HR, Leave, Work Allocation) -- see PLAN.md.

Phase 5 -- Staff/HR:
- Staff/Employee records with designation, department, salary (/staff)
- Leave request apply + admin approve/reject per staff member (/staff/[id])
- Work/Duty allocation with status tracking PENDING/IN_PROGRESS/DONE (/staff/[id])

Next (Phase 6): Communication & Engagement (Notices, Alerts, Events, PTM) -- see PLAN.md.

Phase 6 -- Communication & Engagement:
- Notices/Announcements with audience targeting ALL/TEACHERS/PARENTS/STUDENTS (/notices)
- School Events calendar (/events)
- Service Requests from parents/staff with OPEN/IN_PROGRESS/RESOLVED tracking
  (/service-requests)
- NOT yet built: actual WhatsApp/SMS delivery of notices (needs WhatsApp
  Cloud API or SMS gateway credentials) -- in-app only for now, see Phase 9

Next (Phase 7): Facilities & Operations (Transport, Library, Inventory, Medical,
Visitor Management) -- see PLAN.md.
