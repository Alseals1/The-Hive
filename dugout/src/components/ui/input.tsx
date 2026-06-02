import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    const inputBase =
      "w-full px-4 py-3.5 rounded-xl border bg-pitch-800 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:ring-1 transition-colors";

    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-pitch-700 focus:border-ember focus:ring-ember";

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(inputBase, borderClasses, className)}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400 font-body leading-snug" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
