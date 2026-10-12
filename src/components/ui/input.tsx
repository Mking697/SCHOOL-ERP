import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const baseClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${baseClasses} ${className}`} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = "", ...props }, ref) {
    return <select ref={ref} className={`${baseClasses} ${className}`} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className = "", ...props }, ref) {
    return <textarea ref={ref} className={`${baseClasses} ${className}`} {...props} />;
  }
);

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-slate-600 mb-1">{children}</label>;
}
