# School ERP QA checkpoint — 2026-10-12

Status: initial smoke/desktop UI pass only; NOT comprehensive acceptance or production readiness.

## Executed
- 23 authenticated page URLs returned HTTP 200 using the QA admin session.
- API happy paths: class/section, enquiry, student admission/detail, subject, timetable, holiday, attendance, homework, exam, marks, fee head/structure, single invoice, partial cash payment, staff, notice, event, service request, transport, book catalog/issue, inventory, visitor, virtual class, behavior and achievement.
- Exam sample: 42/50; report HTML returned 200 and contained PASS.
- Fee sample: 5000 invoice, 2000 cash payment, PARTIAL; invoice HTML contained expected values.
- Library issue reduced copies from 5 to 4. Return NOT checked in this pass.
- Desktop screenshots inspected for holidays, enquiries, homework, exams/list/detail, notices, service requests, library, inventory, visitors, virtual class form, fee structure/generate forms, attendance, timetable, admission form, student detail/extras and classes.
- Final unfiltered `npx tsc --noEmit` passed (exit 0).

## Fixes
- Sidebar uses the longest matching path so parent and child entries do not both appear active. After rebuild/restart, live DOM at /students/new contained only New Admission as active.
- Attendance display removes HALF_DAY underscore without changing enum value.
- Service Requests title simplified.

## Still required, in order
1. Real browser form submissions and persisted reloads (not merely API calls/screenshots), including editing and status transitions.
2. Library return, visitor checkout, staff leave/work assignment flows and bulk invoice generation.
3. Negative inputs, duplicate submissions, concurrent payments/issues, authorization by role, and expired session handling.
4. Mobile/tablet layouts, keyboard/focus/accessibility and loading/error states.
5. PDF/print preview of all three reports, long names/many rows, missing marks (must not show PASS for incomplete results), correct physical ID card size.
6. Licensing security review: current HMAC verifier shares signing secret with customer image; do not treat as secure vendor-only signing. Current licensing is banner-only, not enforcement.
7. Installer/update/backup/restore on preserved disposable data.

## Test environment
App at localhost:3000; Docker database school_erp_dev_db on 5434. Keep these QA records; do not recreate/drop this database again. Earlier test database was unfortunately recreated at the start of this pass and the former single-student fixture was lost. Current QA records include Priya Nair/Class 9-B and associated module fixtures. Environment files are local-only; never commit secrets.
