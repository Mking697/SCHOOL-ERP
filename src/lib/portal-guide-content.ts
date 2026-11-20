import type { GuideSection } from "./guide-content";

// Simplified guide for the Student/Parent Portal -- different audience,
// no accounting/HR jargon.
export const PORTAL_GUIDE: GuideSection[] = [
  {
    id: "login",
    title: "Login Kaise Karein",
    intro: "Portal login Admission Number aur password se hota hai.",
    steps: [
      { text: "Admission Number daalo (school se mila hoga, admission ke waqt)." },
      { text: "Password: agar pehli baar login kar rahe ho, default password aapki bachhe ki Date of Birth hai, DDMMYYYY format me.", example: "DOB 07-05-2012 -> Password 07052012" },
      { text: "Login ke baad Profile se apna password badal sakte ho." },
    ],
  },
  {
    id: "fees",
    title: "Fees Dekhna aur Pay Karna",
    intro: "Fees page par aapki saari invoices dikhti hain, itemized (Tuition/Transport/Admission alag-alag).",
    steps: [
      { text: "Fees tab par jao, kisi bhi invoice par click karo -- poori breakdown dikhegi." },
      { text: "Agar unpaid hai, online pay karne ka button dikhega." },
    ],
  },
  {
    id: "attendance-timetable",
    title: "Attendance, Timetable, Holidays",
    intro: "Apne bachhe ki roz ki attendance, class timetable, aur school ki holiday list yahan dikhti hai.",
    steps: [
      { text: "Attendance tab se din-war attendance dekho." },
      { text: "Timetable tab se class ka weekly schedule dekho." },
      { text: "Holidays tab se school ki chhutiyon ki list dekho." },
    ],
  },
  {
    id: "exams",
    title: "Exams aur Report Card",
    intro: "Exam results aur report card bhi isi portal se milte hain.",
    steps: [
      { text: "Exams tab par exam list dikhegi, result aane par usi se Report Card khul jaata hai." },
    ],
  },
  {
    id: "transport",
    title: "School Bus / My Bus",
    intro: "Agar aapka bachha school transport use karta hai.",
    steps: [
      { text: "My Bus tab se route aur stops dekh sakte ho." },
    ],
  },
];
