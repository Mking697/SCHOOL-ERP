// Guide Book content -- organized by module, each section has numbered
// steps with real examples. Shown to every role on /guide (staff) and a
// trimmed version on /portal/guide (parent/student) and /driver/guide.
// `roles` undefined means every staff role sees it; listed roles
// highlight it as "most relevant to you" (everyone can still read every
// section -- this is documentation, not access control).

export type GuideStep = { text: string; example?: string };
export type GuideSection = {
  id: string;
  title: string;
  roles?: string[]; // most relevant staff roles, for highlighting only
  intro: string;
  steps: GuideStep[];
};

export const STAFF_GUIDE: GuideSection[] = [
  {
    id: "getting-started",
    title: "Shuru Kaise Karein",
    intro: "Login karne ke baad aapko sirf apne department ke hi menu items dikhenge -- ye normal hai, security ke liye hai.",
    steps: [
      { text: "Apna email aur password daal kar login karein.", example: "Example: teacher@school.com" },
      { text: "Left sidebar me sirf aapke role ke liye zaroori options dikhenge." },
      { text: "Kabhi bhi is Guide Book icon (top-right, kitab wala icon) ko dabao -- yahi page khulega." },
    ],
  },
  {
    id: "system-overview",
    title: "Yeh Poora System Kya Hai? -- Overview",
    intro:
      "School ERP ek hi jagah se pura school chalane ka system hai. Isme 4 ALAG login-duniya hain -- ek dusre se poori tarah alag, koi overlap nahi:",
    steps: [
      { text: "1) STAFF LOGIN -- yahi app jisme abhi aap hain. Principal/HR/Teacher/Accountant/School Admin apne email-password se login karte hain, sirf apne department ka kaam karte hain." },
      { text: "2) STUDENT/PARENT PORTAL (alag website, link: /portal) -- har student/parent ka apna alag login hota hai. Username = Admission Number, Password = Date of Birth (format DDMMYYYY). Yahan se woh apni Attendance, Fees (online payment sahit), Homework, Report Card, Timetable, Notices dekh sakte hain." },
      { text: "3) DRIVER APP (alag website, link: /driver) -- bus driver ka apna alag login, Vehicle Number + Password se. Driver apne phone se 'Share Location' dabata hai, uski live location School Admin ke Transport page par aur parents ke Portal par dikhti hai." },
      { text: "4) GUIDE BOOK (yeh page) -- har role ke hisaab se step-by-step samjhaya gaya hai, taaki koi bhi naya staff member bina training ke samajh sake." },
      { text: "EFFECT: Ek jagah data daalne se baaki sab jagah khud update ho jaata hai -- jaise Attendance mark karne se Parent Portal mein turant dikh jaata hai, Fee payment hote hi Accounts mein khud entry ban jaati hai." },
    ],
  },
  {
    id: "classes-sections",
    title: "Classes & Sections Banana (Sabse Pehla Kadam)",
    roles: ["HR"],
    intro:
      "Bina Class/Section bane, naya Student admission nahi ho sakta aur Timetable bhi nahi ban sakta -- isliye yeh sabse PEHLA kaam hai jo naye school setup mein karna padta hai.",
    steps: [
      { text: "Classes & Sections page par 'New Class' se class banao (jaise 'Class 10'), phir uske andar Section add karo.", example: "Class 10 -> Section A, Section B" },
      { text: "Har section ki capacity (max students) set kar sakte ho, taaki admission karte waqt turant pata chale kitni seat bachi hai." },
    ],
  },
  {
    id: "enquiries",
    title: "Admission Enquiries (Naya Admission Banane Se Pehle)",
    roles: ["HR"],
    intro:
      "Jab koi parent admission ke liye phone/walk-in se poochta hai, usey pehle 'Enquiry' ke taur par save karo -- baad mein follow-up track karne ke liye, asli Admission banane se pehle.",
    steps: [
      { text: "Enquiries page par 'New Enquiry' -- parent ka naam, phone number, kis class mein admission chahiye, bharo." },
      { text: "Follow-up status update karte raho (Contacted / Visited / Admitted / Not Interested) -- isse report milti hai ki kitni enquiries asli admission mein convert hui." },
    ],
  },
  {
    id: "admission",
    title: "Naya Admission (Student)",
    roles: ["HR", "PRINCIPAL"],
    intro: "New Admission sirf HR aur Principal kar sakte hain.",
    steps: [
      { text: "Pehle Classes & Sections me jaake class aur section bana lo (agar nahi hai).", example: "Example: Class 10, Section A" },
      { text: "Students > New Admission par jao, student ki details bharo -- naam, Date of Birth, class." },
      { text: "DOB dena zaroori hai -- isse Student/Parent Portal ka login AUTOMATIC ban jaata hai (password = DOB, format DDMMYYYY).", example: "DOB 07-05-2012 -> Password 07052012" },
      { text: "Admission ke baad ek screen pe Admission No aur portal password dikhega -- ye parent ko bata do, dobara nahi dikhega." },
    ],
  },
  {
    id: "staff-hr",
    title: "Staff Add Karna + Login Access",
    roles: ["HR"],
    intro: "Staff add karte waqt hi login bhi ek saath ban sakta hai -- do baar jaane ki zaroorat nahi.",
    steps: [
      { text: "Staff/HR > Add Staff par jao, naam/email/role bharo." },
      { text: "'Login access bhi grant karo' checkbox dabao, role (Teacher/Accountant/etc) chuno, password set karo.", example: "Example: Teacher role, password Teacher@123" },
      { text: "Save karte hi staff record aur login dono ek saath ban jaate hain -- agar koi ek fail ho to dono fail honge (safe)." },
      { text: "Baad me password reset karna ho to staff ki detail page par 'Login Access' panel se kar sakte ho." },
    ],
  },
  {
    id: "attendance",
    title: "Attendance (Student aur Staff)",
    roles: ["HR", "TEACHER"],
    intro: "Student attendance Teacher apne period me marks karta hai, Staff attendance HR roster se.",
    steps: [
      { text: "Student Attendance: Attendance page par section choose karo, date choose karo, Present/Absent mark karo." },
      { text: "Staff Attendance: Staff Attendance page par poora staff roster dikhega, har ek ko Present/Absent/Late/Half-day mark karo." },
    ],
  },
  {
    id: "timetable",
    title: "Timetable Banana",
    roles: ["HR"],
    intro: "Pehle Periods (bell schedule) set karo, phir har period me teacher assign karo.",
    steps: [
      { text: "Pehle 'Period' set karo -- Period number, start/end time.", example: "Period 1: 09:00-09:45" },
      { text: "Timetable page par section/day/period choose karke subject + teacher assign karo." },
      { text: "Agar ek teacher ko same time pe 2 jagah assign kiya to system khud reject kar dega (conflict detection)." },
      { text: "Teacher apne dashboard par 'My Timetable' widget me apna din ka schedule dekh sakta hai, LIVE highlight ke saath." },
    ],
  },
  {
    id: "payroll",
    title: "Payroll (Salary)",
    roles: ["ACCOUNTANT"],
    intro: "Har staff ki salary unki profile me set hoti hai, Payroll page se monthly payslip generate hoti hai.",
    steps: [
      { text: "Payroll page par staff list dikhegi, 'Generate Payslip' dabao current month ke liye." },
      { text: "Jab salary de do, 'Mark Paid' dabao -- ye khud-ba-khud Accounting Journal me bhi entry bana deta hai." },
    ],
  },
  {
    id: "transport",
    title: "Transport aur Live Tracking",
    roles: ["SCHOOL_ADMIN"],
    intro: "Route banao, stops map par click karke add karo, driver ko login do.",
    steps: [
      { text: "Transport page par naya Route banao -- naam, vehicle number, driver ka naam." },
      { text: "'Manage Stops' dabao, map par jahan stop hai wahan click karo, naam do, save karo." },
      { text: "Driver ko login activate karo (Activate Driver App button) -- driver apne phone browser se login karega." },
      { text: "'Live Tracking Map' se sabhi buses ka real-time location dekh sakte ho (driver GPS share karega)." },
    ],
  },
  {
    id: "fees",
    title: "Fee Invoices",
    roles: ["ACCOUNTANT"],
    intro: "Fee Structure set karo, phir bulk invoices generate karo.",
    steps: [
      { text: "Fee Structure page par class-wise fee heads set karo.", example: "Example: Class 10 Tuition Fee = 5000/term" },
      { text: "'Generate Invoices' se saare students ke liye ek saath invoices ban jaati hain, itemized (Tuition/Transport/etc alag-alag line me)." },
      { text: "Payment aane par Fee Invoices page se record karo, ya parent khud Portal se online pay kar sakta hai." },
    ],
  },
  {
    id: "chart-of-accounts",
    title: "Chart of Accounts -- Iska Kaam Kya Hai?",
    roles: ["ACCOUNTANT", "PRINCIPAL"],
    intro:
      "Chart of Accounts ek LIST hai jisme school ke paise se judi har cheez ka ek 'box' (account) banaya jaata hai -- jaise Cash ka box, Bank ka box, Salary-kharch ka box, Tuition-fee-kamaai ka box. Har transaction isi list ke boxes ke beech paisa move karti hai. Bina ye list bane, Journal Entries, Vendor Bills, Other Expenses, Petty Cash Book -- kuch bhi kaam nahi karega (dropdown khaali dikhenge).",
    steps: [
      {
        text: "Sabse pehla kaam: 'Seed Default Chart of Accounts' button dabao. Ye ek click me 16 zaroori boxes bana deta hai -- Cash, Bank, Petty Cash, Student Receivables, Vendor Payables, aur kai Income/Expense heads.",
        example: "Jaise ek almirah me labelled drawers ban gaye: 'Cash' drawer, 'Salary Expense' drawer, wagairah.",
      },
      {
        text: "5 tarah ke boxes hote hain -- sahi type chunna zaroori hai: (1) Assets = jahan paisa RAKHA hai (Cash, Bank). (2) Liabilities = jo kisi OR ko DENA hai (Vendor Payables). (3) Equity = school ka khud ka paisa/capital. (4) Income = jo KAMAYA (Tuition Fee). (5) Expenses = jo KHARCH hua (Salary, Stationery).",
      },
      {
        text: "Agar koi naya kharch-type aana hai jo list me nahi hai (jaise 'Internet Bill'), 'New Account' form se khud bana sakte ho -- Code (koi bhi unique number) + Name + Type (yahan 'Expenses' chuno, Internet Bill ek kharch hai, Liability nahi).",
        example: "Code 5099, Name 'Internet Bill', Type = Expenses",
      },
      {
        text: "EFFECT: Jitne zyada sahi-categorized accounts honge, utni hi sahi Profit & Loss aur Balance Sheet banegi. Agar kisi account ka Type galat chun liya (jaise Expense ko Liability bana diya), to Reports me galat jagah dikhega -- is account ko delete karke sahi type se dobara bana lo (sirf tab delete hoga jab usme abhi tak koi transaction na hui ho, Delete icon account ke row ke aage milega).",
      },
    ],
  },
  {
    id: "journal-entries",
    title: "Journal Entries -- Asaan Bhasha Me",
    roles: ["ACCOUNTANT", "PRINCIPAL"],
    intro:
      "Journal Entry matlab: 'paisa kahan se aaya, kahan gaya' -- ye likhna. Har entry me DO jagah likhna padta hai: ek 'Debit' (Dr) side, ek 'Credit' (Cr) side. Jab tak dono taraf ka total BARABAR na ho, entry save hi nahi hogi -- system khud rok dega ('Not balanced' red message dikhega). Ye isiliye zaroori hai taaki paisa 'gayab' ya 'extra' na ho jaaye kisi galti se.",
    steps: [
      {
        text: "Simple soch: paisa jahan se NIKLA (jaise Cash/Bank) -- wahan Credit (Cr) likho. Paisa jahan GAYA / jo cheez kharidi (jaise Salary Expense) -- wahan Debit (Dr) likho.",
        example:
          "Office ka rent 2000 rupaye cash se diya: Line 1 -- Rent Expense, Debit 2000. Line 2 -- Cash, Credit 2000. Dono 2000-2000, barabar.",
      },
      {
        text: "'New Journal Entry' dabao, Date aur Narration (kya transaction hai, jaise 'Office rent paid in cash') bharo, phir 2 ya zyada lines me account choose karke Debit ya Credit amount daalo.",
      },
      {
        text: "'Add Line' se teesri-chauthi line bhi jod sakte ho agar ek transaction me kai cheezein shamil hain.",
        example: "Jaise ek hi bill me Stationery 500 + Internet 300 dono ek Cash payment se diye -- 3 lines: Stationery Dr 500, Internet Dr 300, Cash Cr 800.",
      },
      {
        text: "EFFECT: Har save hui entry turant Petty Cash Book, Trial Balance, Profit & Loss aur Balance Sheet me dikhegi -- alag se kahin update karne ki zaroorat nahi, sab isi ek entry se khud update ho jaata hai.",
      },
      {
        text: "NOTE: Aapko zyadatar manually Journal Entry banane ki zaroorat nahi padegi -- Vendor Bills, Other Expenses aur Payroll jaise pages khud-ba-khud sahi Journal Entry bana dete hain peeche se. Manual Journal Entry sirf un transactions ke liye hai jo kisi specific page me fit nahi hoti.",
      },
    ],
  },
  {
    id: "vendors",
    title: "Vendors / Suppliers -- Kaise Add aur Use Karein",
    roles: ["ACCOUNTANT", "PRINCIPAL"],
    intro:
      "Vendor matlab woh dukaan/supplier/company jisse school saamaan ya service kharidta hai -- jaise stationery wala, building-maintenance wala, bus-fuel wala. Vendor add karne se unke saare bills aur payments ek jagah track hote hain, aur pata chalta hai kisko kitna paisa dena baaki hai.",
    steps: [
      {
        text: "Vendors page par 'New Vendor' form me Name (zaroori), Phone, Email bharo aur 'Add Vendor' dabao.",
        example: "Example: Name 'ABC Stationery Mart', Phone 9876543210",
      },
      {
        text: "Isse koi Journal Entry nahi banti -- Vendor sirf ek DIRECTORY entry hai (jaise phone-book me naya contact save karna). Asli paisa ka hisaab tab shuru hota hai jab is vendor ka koi BILL banaya jaaye (Vendor Bills page par).",
      },
      {
        text: "Vendors list me har vendor ke aage 'Bills' count aur 'Unpaid Total' dikhta hai -- ek nazar me pata chal jaata hai kis vendor ko kitna paisa dena baaki hai.",
      },
      {
        text: "EFFECT (aage kya hoga): Jab bhi is vendor ka naya bill banaoge (Vendor Bills page), wahan ye vendor dropdown me dikhega. Jitne zyada bills is vendor ke against bante jaayenge, utna 'Unpaid Total' badhta jaayega jab tak payment record na ho.",
      },
    ],
  },
  {
    id: "vendor-bills",
    title: "Vendor Bills (Payables) -- Receipt/Invoice Attach Karna",
    roles: ["ACCOUNTANT"],
    intro:
      "Jab kisi Vendor se saamaan/service liya aur paisa abhi ya baad me dena hai, uska record yahan banta hai. Har bill banate hi khud-ba-khud Journal Entry bhi ban jaati hai (Expense Dr, Vendor Payables Cr) -- isiliye Vendor Bills ke dropdown kaam karne ke liye Chart of Accounts me kam se kam ek Expense account hona ZAROORI hai.",
    steps: [
      {
        text: "Pehle vendor select karo (agar list me nahi hai to pehle Vendors page se add karo), Bill Number (optional), Bill Date, Due Date bharo.",
      },
      {
        text: "Description me kya kharida likho, Amount daalo, aur 'Expense Account' dropdown se kaunsa kharch-head hai wo chuno.",
        example: "Description: 'Notebooks and pens', Amount: 3500, Expense Account: 'Other Expense' ya 'Stationery'",
      },
      {
        text: "Receipt/Invoice ki photo ya PDF attach karna ho to 'Attach Receipt / Invoice' field se file choose karo (max 2MB) -- ye saboot ke taur par bill ke saath hamesha safe rehta hai, baad me 'View' link se kabhi bhi dekh sakte ho.",
      },
      {
        text: "'Save Bill' dabao -- bill UNPAID status me banegi. Jab paisa de do, 'Record Payment' dabao, amount aur 'Paid via' (Cash/Bank) chuno -- status khud PARTIALLY_PAID ya PAID ho jaayega.",
      },
      {
        text: "EFFECT: Har bill aur payment Vendor Payables (Liability) account ko aur Expense account ko update karti hai -- isi se Payables Ageing report (Reports page) me pata chalta hai konsa bill kitne din se baaki hai.",
      },
    ],
  },
  {
    id: "accounting-reports",
    title: "Reports -- Pura Profit & Loss Kaise Dekhein",
    roles: ["ACCOUNTANT", "PRINCIPAL"],
    intro: "Jo bhi Journal Entries, Vendor Bills, Other Expenses, Payroll se transactions bani, unse ye saari Reports apne aap ban jaati hain -- kahin alag se calculate nahi karna padta.",
    steps: [
      { text: "Chhoti kharch (chai, stationery) jisme koi vendor nahi -- 'Other Expenses' page se, direct Cash/Bank se." },
      { text: "Petty Cash Book page par Cash account ka pura Date/Particulars/Debit/Credit/Balance view milta hai, print bhi kar sakte ho." },
      { text: "Reports page par 6 tabs hain: Trial Balance, Profit & Loss, Balance Sheet, Receivables Ageing (konsi fees baaki hain, kitne din se), Payables Ageing (konsa vendor bill baaki hai), aur Account Compile Report (sab ek saath)." },
      { text: "Profit & Loss tab se pata chalta hai school ka asli profit/loss -- Income minus Expense, kisi bhi date range ke liye." },
    ],
  },
  {
    id: "exams",
    title: "Exams aur Report Card",
    roles: ["HR", "TEACHER"],
    intro: "HR exam schedule banata hai, Teacher marks dalta hai, Report Card auto-generate hoti hai.",
    steps: [
      { text: "Exams page par exam schedule banao (name, dates, subjects)." },
      { text: "Teacher apne subject ke marks Exams page se hi daal sakta hai." },
      { text: "Har student ki Report Card uske profile se ya Exams page se dekhi ja sakti hai -- yahi report card parent bhi apne Portal se dekh sakta hai." },
    ],
  },
  {
    id: "homework-virtual-classroom",
    title: "Homework aur Virtual Classroom",
    roles: ["TEACHER"],
    intro: "Teacher apne subject ka homework assign karta hai aur online class ka link bhi yahin se share karta hai.",
    steps: [
      { text: "Homework page par apni class/subject chuno, assignment likho, due date do -- yeh turant usi class ke sabhi students ke Parent Portal mein dikh jaata hai." },
      { text: "Virtual Classroom page par Google Meet/Zoom jaisa link paste karo, class/subject/time daalo -- students apne Portal se seedha link dekh ke join kar sakte hain." },
    ],
  },
  {
    id: "holidays",
    title: "Holidays List Banana",
    roles: ["HR"],
    intro: "School ki chhuttiyon ki list -- yeh Staff aur Parent Portal dono jagah khud-ba-khud dikh jaati hai.",
    steps: [
      { text: "Holidays page par 'Add Holiday' -- date aur naam daalo.", example: "15 August -- Independence Day" },
      { text: "Isko alag se kahin bhejne ki zaroorat nahi -- save karte hi Portal aur Staff dashboard dono jagah dikh jaati hai." },
    ],
  },
  {
    id: "communication",
    title: "Notices, Events aur Service Requests",
    roles: ["SCHOOL_ADMIN"],
    intro: "School se jo bhi announcement/information school ke sabhi logon (Staff + Parents dono) tak pahunchani ho, yahan se jaati hai.",
    steps: [
      { text: "Notices page par 'New Notice' -- title aur message likho, Publish karo. Yeh turant Staff dashboard aur Parent Portal dono mein dikhega." },
      { text: "Events page par school ke function/PTM/sports day jaisi dates calendar mein daalo -- sabko dikhti hain." },
      { text: "Service Requests -- agar kisi staff ko kuch repair/maintenance chahiye (jaise 'AC kharab hai'), woh yahan request daal sakta hai; Admin status update karta hai: Open -> In Progress -> Resolved." },
    ],
  },
  {
    id: "transport-live-gps",
    title: "Transport aur Live GPS Tracking",
    roles: ["SCHOOL_ADMIN"],
    intro: "Bus routes, stops aur live location -- sab ek jagah.",
    steps: [
      { text: "Transport page par Route banao (bus number, driver), aur us route ke Stops naksha (map) par pin karo." },
      { text: "Har Driver ko ek login diya jaata hai (Vehicle Number + Password) -- woh apne phone se alag 'Driver App' (link: /driver) khol ke login karta hai." },
      { text: "Driver 'Share Location' dabata hai to uski bus ki live location is Transport page par aur parents ke Portal map par real-time dikhti hai." },
    ],
  },
  {
    id: "library",
    title: "Library -- Books Issue/Return",
    roles: ["SCHOOL_ADMIN"],
    intro: "Library module mein books ka catalogue rehta hai aur kis student ko kaunsi book di hai uska record.",
    steps: [
      { text: "Library page par 'Add Book' se naya book catalogue mein daalo -- title, author, total copies." },
      { text: "'Issue Book' se student ko book do -- system khud track karta hai kitni copies available hain." },
      { text: "Jab book wapas aaye, 'Return' dabao -- late-return fine system khud calculate nahi karta, yeh manually dekhna hoga." },
    ],
  },
  {
    id: "inventory",
    title: "Inventory -- School ka Saamaan Track Karna",
    roles: ["SCHOOL_ADMIN"],
    intro: "School ka furniture, computers, sports equipment jaisa saamaan -- kitna hai, kahan hai -- yahan track hota hai.",
    steps: [
      { text: "Inventory page par 'Add Item' -- naam, quantity, location (jaise 'Lab 1', 'Store Room') bharo.", example: "Item: Desktop Computer, Quantity: 20, Location: Computer Lab" },
      { text: "Stock kam/zyada hone par quantity update kar sakte ho -- yeh simple tracking hai, automatic reorder jaisa kuch nahi." },
    ],
  },
  {
    id: "visitors",
    title: "Visitors -- School Aane Walon ka Record",
    roles: ["SCHOOL_ADMIN"],
    intro: "Security ke liye -- school mein kaun aaya, kis se milne, kab aaya kab gaya -- sab yahan record hota hai.",
    steps: [
      { text: "Visitors page par 'New Visitor' -- naam, phone, kis se milne aaya, purpose bharo, 'Check In' karo." },
      { text: "Jaate waqt 'Check Out' dabao -- poora record (kitni der rukha) save ho jaata hai." },
    ],
  },
  {
    id: "portal-driver-overview",
    title: "Student/Parent Portal aur Driver App -- Yeh Kya Hain?",
    intro:
      "Yeh dono is staff-app se BILKUL ALAG hain -- staff inhe seedha isi login se access nahi karte, bas inke liye data taiyar karte hain.",
    steps: [
      {
        text: "STUDENT/PARENT PORTAL (link: /portal): Har student ka Admission Number hi uska username hai, password = Date of Birth (format DDMMYYYY, Admission ke waqt generate hota hai). Yahan se parent/student apni Attendance, Fees (online payment sahit), Homework, Report Card, Timetable, Notices dekh sakte hain.",
      },
      {
        text: "DRIVER APP (link: /driver): Bus driver ko Transport module se login diya jaata hai (Vehicle Number + Password). Driver apne phone ke browser se login karta hai aur 'Share Location' dabata hai -- uski live location School Admin ke Transport page par aur parents ke Portal par dikhti hai.",
      },
    ],
  },
  {
    id: "export-feature",
    title: "Excel/CSV Export -- Kahin Bhi Data Nikalna",
    intro: "System ke har list/table page (Students, Staff, Fees, Attendance, Timetable, Transport, Library, Visitors, aadi) ke upar do button milenge.",
    steps: [
      { text: "'Export Excel' dabane se usi waqt screen par dikh rahi list ek .xlsx file mein download ho jaati hai -- Excel mein khol sakte ho." },
      { text: "'Export CSV' bhi waisa hi hai, bas .csv format mein -- agar kisi dusre software mein import karna ho to yeh zyada kaam aata hai." },
      { text: "Yeh sirf wahi data export karta hai jo screen par abhi dikh raha hai -- agar koi filter/search laga rakha hai, wahi filtered data jaata hai." },
    ],
  },
  {
    id: "analytics-dashboard",
    title: "Dashboard aur Analytics",
    roles: ["SCHOOL_ADMIN", "HR"],
    intro: "Login karte hi jo pehla page khulta hai (Dashboard), wahan school ki overall summary dikhti hai -- total students, staff, aaj ki attendance, pending fees, aadi.",
    steps: [
      { text: "Teacher ko apne dashboard par sirf apne din ka timetable aur apni class summary dikhti hai (live highlight ke saath)." },
      { text: "Analytics page (Principal/School Admin/HR ke liye) mein zyada detailed charts/graphs hote hain -- jaise attendance trend aur fee collection trend, time ke saath." },
    ],
  },
  {
    id: "license-apps-downloads",
    title: "License aur Apps & Downloads",
    roles: ["SCHOOL_ADMIN"],
    intro: "System Admin ke liye 2 chhote system pages.",
    steps: [
      { text: "License page par pata chalta hai aapka installation kab tak valid hai (expiry date) -- hosted/subscription plan ho to renewal/payment yahin se hota hai." },
      { text: "Apps & Downloads page par School ERP ke sabhi companion links (Student/Parent Portal, Driver App) ek jagah milte hain -- QR code se bhi share kar sakte ho." },
    ],
  },
];
