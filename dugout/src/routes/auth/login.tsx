import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

type LoginErrors = {
  email?: string;
  password?: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  function validate(): LoginErrors {
    const errs: LoginErrors = {};
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    }
    return errs;
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      const pendingToken = sessionStorage.getItem("invite_token");
      if (pendingToken) {
        sessionStorage.removeItem("invite_token");
        sessionStorage.removeItem("invite_role");
        await navigate({ to: "/invite/$token", params: { token: pendingToken } });
      } else {
        await navigate({ to: "/teams" });
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
      <div className="mb-10">
        <p className="font-display text-xs font-600 uppercase tracking-[0.2em] text-ember mb-2">
          The Hive
        </p>
        <h1 className="font-display text-5xl font-800 uppercase tracking-tight text-pitch-50 leading-none">
          Dugout
        </h1>
        <p className="text-sm text-pitch-400 mt-3 font-body">
          Your team, all in one place.
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="you@example.com"
            error={fieldErrors.email}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="••••••••"
            error={fieldErrors.password}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button loading={loading} type="submit" className="mt-2">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-pitch-400">
        No account?{" "}
        <a
          href="/auth/signup"
          className="text-ember font-display font-600 uppercase tracking-wider text-xs"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
