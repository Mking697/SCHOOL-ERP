import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600 shadow-sm",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-indigo-600",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-indigo-600",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600 shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ variant = "primary", size = "md", className = "", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
});
