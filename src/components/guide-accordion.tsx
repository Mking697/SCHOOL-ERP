"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { GuideSection } from "@/lib/guide-content";

export function GuideAccordion({ sections, currentRole }: { sections: GuideSection[]; currentRole?: string }) {
  const [open, setOpen] = useState<string | null>(sections[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {sections.map((s) => {
        const isRelevant = currentRole && (s.roles?.includes(currentRole) ?? true);
        return (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800 flex items-center gap-2">
                {s.title}
                {s.roles && isRelevant && (
                  <span className="inline-flex items-center gap-1 text-xs font-normal text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3" />
                    Aapke liye
                  </span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open === s.id ? "rotate-180" : ""}`} />
            </button>
            {open === s.id && (
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-500 mb-3">{s.intro}</p>
                <ol className="space-y-2.5">
                  {s.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span>
                        {step.text}
                        {step.example && (
                          <span className="block text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-1 mt-1 inline-block">
                            {step.example}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
