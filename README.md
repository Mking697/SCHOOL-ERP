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
- Local dev: copy `.env.example` to `.env`, point `DATABASE_URL` at a local
  Postgres, then:
  ```
  npm install
  npx prisma migrate dev
  npx prisma db seed
  npm run dev
  ```
- Prisma Client is generated to `src/generated/prisma` (not `node_modules`) --
  Prisma 7 requirement. Run `npx prisma generate` after pulling schema changes.
- Auth middleware lives in `src/proxy.ts` (Next.js 16 renamed `middleware.ts`
  to `proxy.ts`).
- See `../PLAN.md` (one level up) for the full module roadmap and phases.

## Current status (Phase 0 + Phase 1 + Phase 2 done)

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

Next (Phase 3): Fee Management + Razorpay online payments -- see PLAN.md.
