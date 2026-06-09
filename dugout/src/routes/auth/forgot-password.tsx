import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { resetPasswordRequestSchema } from "@/lib/validationSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const result = resetPasswordRequestSchema.safeParse({ email });
    if (!result.success) return result.error.issues[0]?.message ?? "Invalid email.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setEmailError(undefined);
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSubmitted(true);
    }

    setLoading(false);
  }

  if (submitted) {
    return (
      <>
        <Helmet><title>Check Your Email | Dugout</title></Helmet>
        <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
          <div className="mb-10">
            <p className="font-display text-xs font-600 uppercase tracking-[0.2em] text-ember mb-2">
              The Hive
            </p>
            <h1 className="font-display text-5xl font-800 uppercase tracking-tight text-pitch-50 leading-none">
              Dugout
            </h1>
          </div>

          <div className="bg-pitch-800 border border-pitch-700 rounded-2xl p-6 space-y-2">
            <p className="font-display font-600 uppercase tracking-wide text-pitch-50 text-sm">
              Check your email
            </p>
            <p className="text-sm text-pitch-400 font-body leading-relaxed">
              We sent a reset link to{" "}
              <span className="text-pitch-200">{email}</span>. Follow the link
              in your inbox to set a new password.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-pitch-400">
            Back to{" "}
            <a
              href="/auth/login"
              className="text-ember font-display font-600 uppercase tracking-wider text-xs"
            >
              Sign in
            </a>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Forgot Password | Dugout</title></Helmet>
      <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
        <div className="mb-10">
          <p className="font-display text-xs font-600 uppercase tracking-[0.2em] text-ember mb-2">
            The Hive
          </p>
          <h1 className="font-display text-5xl font-800 uppercase tracking-tight text-pitch-50 leading-none">
            Dugout
          </h1>
          <p className="text-sm text-pitch-400 mt-3 font-body">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelCls}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-required="true"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(undefined);
              }}
              placeholder="you@example.com"
              error={emailError}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <Button loading={loading} type="submit" className="mt-2">
            {loading ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-pitch-400">
          Remember it?{" "}
          <a
            href="/auth/login"
            className="text-ember font-display font-600 uppercase tracking-wider text-xs"
          >
            Sign in
          </a>
        </p>
      </div>
    </>
  );
}
