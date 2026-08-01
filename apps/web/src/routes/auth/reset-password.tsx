import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { resetPasswordConfirmSchema } from "@/lib/validationSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPasswordPage,
});

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type ConfirmErrors = { password?: string; confirmPassword?: string };
type Mode = "loading" | "form" | "success" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ConfirmErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase embeds type=recovery in hash or search params after redirect
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);

    if (
      hashParams.get("type") === "recovery" ||
      searchParams.get("type") === "recovery"
    ) {
      setMode("form");
      return;
    }

    // Also listen for PASSWORD_RECOVERY auth state event (fired by Supabase SDK)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("form");
      }
    });

    // Fallback: if no recovery signal in 3s the link is invalid/expired
    const timeout = setTimeout(() => {
      setMode((current) => (current === "loading" ? "invalid" : current));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  function validate(): ConfirmErrors {
    const result = resetPasswordConfirmSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errs: ConfirmErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "password" || field === "confirmPassword") {
          errs[field] = issue.message;
        }
      });
      return errs;
    }
    return {};
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setError(null);
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMode("success");
    }

    setLoading(false);
  }

  const header = (
    <div className="mb-10">
      <p className="font-display text-xs font-600 uppercase tracking-[0.2em] text-ember mb-2">
        The Hive
      </p>
      <h1 className="font-display text-5xl font-800 uppercase tracking-tight text-pitch-50 leading-none">
        Dugout
      </h1>
    </div>
  );

  if (mode === "loading") {
    return (
      <>
        <Helmet><title>Reset Password | Dugout</title></Helmet>
        <div className="min-h-screen bg-pitch-900 flex flex-col justify-center items-center px-6">
          <p className="text-pitch-400 text-sm font-body">Verifying reset link…</p>
        </div>
      </>
    );
  }

  if (mode === "invalid") {
    return (
      <>
        <Helmet><title>Invalid Link | Dugout</title></Helmet>
        <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
          {header}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-5 space-y-2">
            <p className="font-display font-600 uppercase tracking-wide text-red-400 text-sm">
              Link expired or invalid
            </p>
            <p className="text-sm text-pitch-400 font-body leading-relaxed">
              This reset link has expired or is no longer valid. Please request
              a new one.
            </p>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: "/auth/forgot-password" })}>
              Request a new link
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (mode === "success") {
    return (
      <>
        <Helmet><title>Password Updated | Dugout</title></Helmet>
        <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
          {header}
          <div className="bg-pitch-800 border border-pitch-700 rounded-2xl p-6 space-y-2">
            <p className="font-display font-600 uppercase tracking-wide text-pitch-50 text-sm">
              Password updated
            </p>
            <p className="text-sm text-pitch-400 font-body leading-relaxed">
              Your password has been changed. Sign in with your new password.
            </p>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: "/auth/login" })}>
              Sign In
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>New Password | Dugout</title></Helmet>
      <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
        {header}
        <p className="text-sm text-pitch-400 -mt-6 mb-8 font-body">
          Choose a strong new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className={labelCls}>
              New Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-required="true"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password)
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Minimum 8 characters"
              error={fieldErrors.password}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelCls}>
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-required="true"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
              }}
              placeholder="••••••••"
              error={fieldErrors.confirmPassword}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button loading={loading} type="submit" className="mt-2">
            {loading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </>
  );
}
