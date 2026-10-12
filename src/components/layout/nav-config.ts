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
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Academics",
    items: [
      { label: "Students", href: "/students", icon: Users },
      { label: "New Admission", href: "/students/new", icon: UserPlus },
      { label: "Classes & Sections", href: "/classes", icon: School },
      { label: "Enquiries", href: "/enquiries", icon: ClipboardList },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck },
      { label: "Timetable", href: "/timetable", icon: CalendarClock },
      { label: "Holidays", href: "/holidays", icon: PartyPopper },
      { label: "Homework", href: "/homework", icon: BookOpenCheck },
      { label: "Exams", href: "/exams", icon: GraduationCap },
      { label: "Virtual Classroom", href: "/virtual-classes", icon: Video },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Fee Invoices", href: "/fees", icon: Wallet },
      { label: "Fee Structure", href: "/fees/structure", icon: Receipt },
      { label: "Generate Invoices", href: "/fees/generate", icon: FileSpreadsheet },
    ],
  },
  {
    label: "People",
    items: [{ label: "Staff / HR", href: "/staff", icon: Briefcase }],
  },
  {
    label: "Communication",
    items: [
      { label: "Notices", href: "/notices", icon: Megaphone },
      { label: "Events", href: "/events", icon: CalendarDays },
      { label: "Service Requests", href: "/service-requests", icon: LifeBuoy },
    ],
  },
  {
    label: "Facilities",
    items: [
      { label: "Transport", href: "/transport", icon: Bus },
      { label: "Library", href: "/library", icon: Library },
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Visitors", href: "/visitors", icon: UserCheck2 },
    ],
  },
  {
    label: "System",
    items: [
      { label: "License", href: "/license", icon: BadgeCheck },
      { label: "Apps & Downloads", href: "/apps", icon: LayoutGrid },
    ],
  },
];
