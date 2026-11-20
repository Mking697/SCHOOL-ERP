import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserPlus,
  School,
  ClipboardList,
  CalendarCheck,
  CalendarClock,
  PartyPopper,
  BookOpenCheck,
  GraduationCap,
  Video,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Briefcase,
  Megaphone,
  CalendarDays,
  LifeBuoy,
  Bus,
  Library,
  Boxes,
  UserCheck2,
  BadgeCheck,
  LayoutGrid,
  BookOpenText,
  BookText,
  Building2,
  FileWarning,
  CircleDollarSign,
  FileBarChart,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type StaffRole = "SUPER_ADMIN" | "PRINCIPAL" | "SCHOOL_ADMIN" | "HR" | "TEACHER" | "ACCOUNTANT";

// Department ownership (approved design, Oct 17 2026):
//   HR          -- Admissions, Classes/Sections, Students, Enquiries, Attendance
//                  (policy/reports), Timetable (builds it), Holidays, Exams (schedules)
//   TEACHER     -- Homework/Assignments, Virtual Classroom, + marks entry on Exams,
//                  + marking their own periods' Attendance
//   ACCOUNTANT  -- Finance (Fee Invoices/Structure/Generate Invoices)
//   SCHOOL_ADMIN-- Communication, Facilities, System (the "System Admin" department)
//   PRINCIPAL   -- everything, read/write, across every department
//   SUPER_ADMIN -- the installing/vendor account; always unrestricted (see
//                  isPathAllowedForRole below), not listed in any `roles` array.
const HR_ONLY: StaffRole[] = ["PRINCIPAL", "HR"];
const HR_AND_TEACHER: StaffRole[] = ["PRINCIPAL", "HR", "TEACHER"];
const TEACHER_ONLY: StaffRole[] = ["PRINCIPAL", "TEACHER"];
const FINANCE_ONLY: StaffRole[] = ["PRINCIPAL", "ACCOUNTANT"];
const ADMIN_ONLY: StaffRole[] = ["PRINCIPAL", "SCHOOL_ADMIN"];
const ANALYTICS: StaffRole[] = ["PRINCIPAL", "SCHOOL_ADMIN", "HR"];

// `roles` left undefined means every staff role can see/use it (currently
// only Dashboard, Holidays, Notices, Events and Apps & Downloads -- things
// every department needs visibility into). Only list `roles` to RESTRICT an
// item -- this is the single source of truth for both what the
// sidebar/dashboard show and what proxy.ts enforces server-side (see
// isPathAllowedForRole). Note: this is route-level (page/API) granularity --
// it does not yet distinguish "view" vs "edit" within one page (e.g. Teacher
// can open /timetable and /exams, but should only edit their own slice;
// that finer check still needs to be added inside those pages/APIs).
export type NavItem = { label: string; href: string; icon: LucideIcon; roles?: StaffRole[] };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ANALYTICS },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Students", href: "/students", icon: Users, roles: HR_AND_TEACHER },
      { label: "New Admission", href: "/students/new", icon: UserPlus, roles: HR_ONLY },
      { label: "Classes & Sections", href: "/classes", icon: School, roles: HR_ONLY },
      { label: "Enquiries", href: "/enquiries", icon: ClipboardList, roles: HR_ONLY },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: HR_AND_TEACHER },
      { label: "Timetable", href: "/timetable", icon: CalendarClock, roles: HR_AND_TEACHER },
      { label: "Holidays", href: "/holidays", icon: PartyPopper },
      { label: "Homework", href: "/homework", icon: BookOpenCheck, roles: TEACHER_ONLY },
      { label: "Exams", href: "/exams", icon: GraduationCap, roles: HR_AND_TEACHER },
      { label: "Virtual Classroom", href: "/virtual-classes", icon: Video, roles: TEACHER_ONLY },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Fee Invoices", href: "/fees", icon: Wallet, roles: FINANCE_ONLY },
      { label: "Fee Structure", href: "/fees/structure", icon: Receipt, roles: FINANCE_ONLY },
      { label: "Generate Invoices", href: "/fees/generate", icon: FileSpreadsheet, roles: FINANCE_ONLY },
      { label: "Payroll", href: "/payroll", icon: Briefcase, roles: FINANCE_ONLY },
      { label: "Chart of Accounts", href: "/accounts", icon: BookText, roles: FINANCE_ONLY },
      { label: "Journal Entries", href: "/journal-entries", icon: BookOpenText, roles: FINANCE_ONLY },
      { label: "Vendors", href: "/vendors", icon: Building2, roles: FINANCE_ONLY },
      { label: "Vendor Bills", href: "/bills", icon: FileWarning, roles: FINANCE_ONLY },
      { label: "Other Expenses", href: "/expenses", icon: CircleDollarSign, roles: FINANCE_ONLY },
      { label: "Petty Cash Book", href: "/petty-cash-book", icon: Wallet, roles: FINANCE_ONLY },
      { label: "Reports", href: "/reports", icon: FileBarChart, roles: FINANCE_ONLY },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Staff / HR", href: "/staff", icon: Briefcase, roles: HR_ONLY },
      { label: "Staff Attendance", href: "/staff-attendance", icon: CalendarCheck, roles: HR_ONLY },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Notices", href: "/notices", icon: Megaphone },
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Service Requests", href: "/service-requests", icon: LifeBuoy, roles: ADMIN_ONLY },
    ],
  },
  {
    label: "Facilities",
    items: [
      { label: "Transport", href: "/transport", icon: Bus, roles: ADMIN_ONLY },
      { label: "Library", href: "/library", icon: Library, roles: ADMIN_ONLY },
      { label: "Inventory", href: "/inventory", icon: Boxes, roles: ADMIN_ONLY },
      { label: "Visitors", href: "/visitors", icon: UserCheck2, roles: ADMIN_ONLY },
    ],
  },
  {
    label: "System",
    items: [
      { label: "License", href: "/license", icon: BadgeCheck, roles: ADMIN_ONLY },
      { label: "Apps & Downloads", href: "/apps", icon: LayoutGrid },
      { label: "Guide Book", href: "/guide", icon: BookOpen },
    ],
  },
];

export function navGroupsForRole(role: string): NavGroup[] {
  if (role === "SUPER_ADMIN") return navGroups;
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role as StaffRole)),
    }))
    .filter((group) => group.items.length > 0);
}

// Server-side enforcement (proxy.ts): is this request path allowed for this
// role? Matches the LONGEST nav href prefix (so "/students/new", which is
// HR-only, overrides the broader HR+Teacher "/students"), and applies the
// same restriction to both the page route and its "/api" counterpart.
// Paths with no matching nav item are left unrestricted here (e.g. detail
// pages like /staff/[id] which already check `session.role` themselves, and
// cross-cutting routes like /dashboard, /api/auth/*, /setup).
export function isPathAllowedForRole(pathname: string, role: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const matchesItem = (item: NavItem) => {
    const apiHref = "/api" + item.href;
    return (
      pathname === item.href ||
      pathname.startsWith(item.href + "/") ||
      pathname === apiHref ||
      pathname.startsWith(apiHref + "/")
    );
  };
  const candidates = navGroups.flatMap((g) => g.items).filter(matchesItem);
  const match = candidates.sort((a, b) => b.href.length - a.href.length)[0];
  if (!match || !match.roles) return true;
  return match.roles.includes(role as StaffRole);
}
