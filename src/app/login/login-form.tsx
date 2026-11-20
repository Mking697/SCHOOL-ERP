"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowRight, BookOpen, CalendarDays, Check, ChevronRight,
  Eye, EyeOff, GraduationCap, LockKeyhole, Server, ShieldCheck, Users, Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/ui/brand-mark";
import { INITIAL_PURCHASE_DAYS, INITIAL_PURCHASE_PRICE_INR, SCHOOL_TIERS, plansForTier } from "@/lib/commercial-catalog";

const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
const features = [
  { icon: Users, title: "Students & academics", text: "Admissions, student records, classes, homework and report cards." },
  { icon: Wallet, title: "Fees, without the paperwork", text: "Fee invoices, payment records and printable receipts in one place." },
  { icon: CalendarDays, title: "A connected school day", text: "Attendance, timetables, notices and events for your school team." },
  { icon: BookOpen, title: "Beyond the classroom", text: "Staff, library, transport and inventory, with parent and driver portals." },
];

export default function LoginForm({ schoolName, logoUrl }: { schoolName: string; logoUrl: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(15_000),
      });
      const data: unknown = await res.json();
      if (!res.ok || !data || typeof data !== "object" || !("ok" in data) || data.ok !== true) {
        const message = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error.slice(0, 300) : "Sign-in failed. Please check your email and password.";
        setError(message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Check your connection and try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <div id="top" className="min-h-screen bg-[#f6f8fc] text-slate-900 selection:bg-indigo-100">
      <a href="#school-sign-in" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-indigo-700">Skip to school sign in</a>
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <a href="#top" aria-label={`${schoolName} home`} className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200"><BrandMark logoUrl={logoUrl} schoolName={schoolName} className="size-7 text-white" /></span>
            <span className="min-w-0"><span className="block max-w-48 truncate text-sm font-semibold sm:max-w-80">{schoolName}</span><span className="block text-[11px] font-medium tracking-wide text-slate-500">SCHOOL ERP · BY ESSOR AUTOMATIONS</span></span>
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium">
            <a href="#features" className="hidden text-slate-600 transition hover:text-indigo-600 sm:block">The software</a>
            <a href="#plans" className="text-slate-600 transition hover:text-indigo-600">Plans</a>
            <a href="/apps" className="hidden items-center gap-1 text-indigo-600 hover:text-indigo-800 md:inline-flex">Explore apps <ArrowRight className="size-4" /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200/80">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-52 size-[700px] rounded-full bg-[radial-gradient(circle,_#e0e7ff_0%,_transparent_67%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"><span className="size-1.5 rounded-full bg-indigo-500" /> YOUR SCHOOL. YOUR SERVER. YOUR CONTROL.</div>
              <h1 className="max-w-xl text-[2.6rem] font-semibold leading-[1.12] tracking-[-0.045em] text-[#14213d] sm:text-6xl">Less administration.<br /><span className="text-indigo-600">More education.</span></h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">A calmer way to run your school. Bring students, academics, fees and everyday operations together—on your own server.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#features" className="inline-flex items-center gap-2 rounded-lg bg-[#182544] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600">Discover School ERP <ArrowRight className="size-4" /></a>
                <a href="#plans" className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-indigo-700 hover:text-indigo-900">Simple, transparent plans <ChevronRight className="size-4" /></a>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-slate-200 pt-6">
                {[{ icon: Server, title: "Self-hosted", text: "Your infrastructure" }, { icon: ShieldCheck, title: "School-owned data", text: "Stored on your server" }, { icon: GraduationCap, title: "One workspace", text: "For your school team" }].map(({ icon: Icon, title, text }) => <div key={title}><Icon className="mb-2 size-5 text-indigo-600" /><p className="text-xs font-semibold text-slate-800 sm:text-sm">{title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">{text}</p></div>)}
              </div>
            </div>

            <div id="school-sign-in" className="scroll-mt-8 rounded-2xl border border-white bg-white p-6 shadow-[0_20px_65px_-25px_rgba(50,50,93,0.25)] sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LockKeyhole className="size-5" /></span><span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-500">STAFF & ADMIN</span></div>
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to {schoolName}&apos;s workspace.</p>
              <form onSubmit={handleSubmit} aria-label="School staff sign in" aria-busy={loading} className="mt-6 space-y-5">
                {error && <div role="alert" className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{error}</span></div>}
                <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label><Input id="login-email" name="email" type="email" autoComplete="username" required disabled={loading} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@school.edu" className="h-12 bg-slate-50/50" /></div>
                <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="relative"><Input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={loading} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 bg-slate-50/50 pr-12" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-400 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>
                <Button type="submit" disabled={loading} className="h-12 w-full text-sm">{loading ? "Signing in…" : "Sign in to dashboard"}<ArrowRight className="size-4" /></Button>
                <p className="text-center text-xs leading-5 text-slate-500">Need access or a password reset? Contact your school administrator.</p>
              </form>
              <div className="mt-6 border-t border-slate-100 pt-5"><p className="mb-3 text-xs text-slate-500">Looking for a different workspace?</p><div className="grid grid-cols-2 gap-3"><a href="/portal/login" className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">Parent & Student <span aria-hidden="true">↗</span></a><a href="/driver/login" className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">Driver portal <span aria-hidden="true">↗</span></a></div></div>
            </div>
          </div>
        </section>

        <section id="features" aria-labelledby="features-heading" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold tracking-[0.15em] text-indigo-600">BUILT AROUND YOUR SCHOOL</p><h2 id="features-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#14213d]">The everyday essentials, connected.</h2></div><a href="/apps" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600">Explore the school apps <ArrowRight className="size-4" /></a></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-6"><span className="mb-5 flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Icon className="size-5" /></span><h3 className="text-sm font-semibold text-slate-800">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></article>)}</div>
        </section>

        <section id="plans" aria-labelledby="plans-heading" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl scroll-mt-8 px-5 py-14 sm:px-8 sm:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center"><p className="text-xs font-semibold tracking-[0.15em] text-indigo-600">STRAIGHTFORWARD PRICING</p><h2 id="plans-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#14213d] sm:text-4xl">One workspace. A plan for your school.</h2><p className="mt-4 text-sm leading-6 text-slate-500">The same core School ERP modules across every size band. After your included first month, renew monthly or save with a longer billing cycle. Renewals are paid upfront, not automatic bank debits.</p></div>
            <div id="getting-started" className="mb-6 grid items-center gap-6 rounded-xl bg-[#182544] p-6 text-white sm:grid-cols-[1fr_auto] sm:p-8"><div><span className="text-xs font-medium tracking-widest text-indigo-200">FIRST PURCHASE · ALL STANDARD SIZE BANDS</span><h3 className="mt-2 text-xl font-semibold">Your school&apos;s own ERP setup</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Self-hosted setup + your first {INITIAL_PURCHASE_DAYS} days of subscription. Install on your school server, then complete the school and admin setup wizard.</p><p className="mt-3 text-xs leading-5 text-indigo-200">New purchases and setup downloads are not available from this sign-in page.</p></div><div className="sm:text-right"><p className="text-4xl font-semibold tracking-tight">{formatInr(INITIAL_PURCHASE_PRICE_INR)}</p><p className="mt-2 text-xs text-indigo-200">Initial purchase · first month included</p></div></div>
            <div className="grid gap-5 md:grid-cols-3">{SCHOOL_TIERS.map((tier, index) => {
              const plans = plansForTier(tier.id);
              const capacity = index === 0 ? `Up to ${tier.maxStudents} students` : `${(SCHOOL_TIERS[index - 1].maxStudents + 1).toLocaleString("en-IN")}–${tier.maxStudents.toLocaleString("en-IN")} students`;
              return <article key={tier.id} className={`relative flex flex-col rounded-xl border p-6 ${tier.id === "GROWTH" ? "border-indigo-300 bg-indigo-50/40 ring-1 ring-indigo-200" : "border-slate-200 bg-white"}`}>
                <h3 className="text-lg font-semibold text-slate-800">{tier.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{capacity}</p>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-[#14213d]">{formatInr(tier.monthlyPriceInr)}</p><p className="mt-2 text-sm text-slate-500">Monthly · per {plans[0].days} days</p>
                <dl className="mt-6 space-y-5 border-y border-slate-200/80 py-5">{plans.slice(1).map(plan => <div key={plan.id}>
                  <dt className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-700"><span>{plan.label}</span><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Save {plan.discountPct}%</span></dt>
                  <dd className="mt-2 text-xl font-semibold text-[#14213d]">{formatInr(plan.priceInr)} <span className="text-xs font-normal text-slate-500">upfront · {plan.days} days</span></dd>
                  <dd className="mt-1 text-xs leading-5 text-slate-500">{formatInr(plan.monthlyEquivalentInr)}/month equivalent · save {formatInr(plan.savingsInr)} against monthly pricing</dd>
                </div>)}</dl>
                <ul className="my-6 flex-1 space-y-3 text-sm text-slate-600">{["Core School ERP modules included", "Self-hosted school database", "Parent, student & driver portals"].map(item => <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-indigo-600" />{item}</li>)}</ul>
                <a href="#school-sign-in" className={`inline-flex justify-center rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 ${tier.id === "GROWTH" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>Sign in to renew <ArrowRight className="ml-2 size-4" /></a>
              </article>;
            })}</div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm text-slate-600">More than 1,500 students or multiple campuses? A custom quote is required.</div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-slate-500">Student bands describe pricing eligibility, not automatically enforced student quotas. Your billing administrator assigns your school&apos;s tier. Renewal plans apply after the first {INITIAL_PURCHASE_DAYS} days. Existing schools sign in to renew when due. School subscription payments and parent fee payments are separate.</p>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:px-8"><p>School ERP by Essor Automations</p><p className="flex items-center gap-2"><Server className="size-3.5" /> Your school data stays on your own server.</p></footer>
    </div>
  );
}
