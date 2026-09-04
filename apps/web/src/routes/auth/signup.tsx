import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { signupSchema } from "@/lib/validationSchemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

function friendlyAuthError(msg: string): string {
  if (msg === "Failed to fetch" || msg.toLowerCase().includes("networkerror") || msg.toLowerCase().includes("failed to fetch"))
    return "Can't reach the dugout right now. Check your connection.";
  return msg;
}

type AccountType = "organizer" | "member";

const ACCOUNT_TYPES: {
  value: AccountType;
  label: string;
  description: string;
}[] = [
  {
    value: "organizer",
    label: "Coach / Admin",
    description: "I manage or coach a team",
  },
  {
    value: "member",
    label: "Parent / Player",
    description: "I'm joining a team",
  },
];

function roleToAccountType(role: string | null): AccountType {
  if (role === "coach" || role === "admin" || role === "manager") return "organizer";
  return "member";
}

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
};

function SignupPage() {
  const navigate = useNavigate();

  const pendingToken = sessionStorage.getItem("invite_token");
  const pendingRole  = sessionStorage.getItem("invite_role");
  const pendingJoinCode = sessionStorage.getItem("join_code");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    roleToAccountType(pendingRole),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [passwordTouched, setPasswordTouched] = useState(false);

  function validate(): SignupErrors {
    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: SignupErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "name" || field === "email" || field === "password") {
          fieldErrors[field] = issue.message;
        }
      });
      return fieldErrors;
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, account_type: accountType } },
    });

    if (signUpError) {
      setError(friendlyAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    // usePendingJoin (root layout) handles any pending join_code / invite_token
    await navigate({ to: "/teams" });

    setLoading(false);
  }

  return (
    <>
      <Helmet><title>Sign Up | Dugout</title></Helmet>
      <div className="min-h-screen bg-pitch-900 flex flex-col justify-center px-6">
      <div className="mb-10">
        <p className="font-display text-xs font-600 uppercase tracking-[0.2em] text-ember mb-2">
          The Hive
        </p>
        <h1 className="font-display text-5xl font-800 uppercase tracking-tight text-pitch-50 leading-none">
          Dugout
        </h1>
        <p className="text-sm text-pitch-400 mt-3 font-body">
          Create your account to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account type */}
        <div>
          <p className={labelCls}>I am a</p>
          <div className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map((opt) => {
              const isSelected = accountType === opt.value;
              const locked = !!pendingToken || !!pendingJoinCode;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => !locked && setAccountType(opt.value)}
                  disabled={locked && !isSelected}
                  className={`flex flex-col gap-0.5 px-3 py-3 rounded-xl border text-left transition-colors ${
                    isSelected
                      ? "border-ember bg-ember-muted"
                      : "border-pitch-700 bg-pitch-800 opacity-30"
                  } ${locked ? "cursor-default" : ""}`}
                >
                  <span
                    className={`text-sm font-display font-600 uppercase tracking-wide ${
                      isSelected ? "text-ember" : "text-pitch-100"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-pitch-400 font-body leading-snug">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
          {(pendingToken || pendingJoinCode) && (
            <p className="text-[11px] text-pitch-500 font-body mt-1">
              Role set by your invite — cannot be changed.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className={labelCls}>
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            aria-required="true"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
            }}
            placeholder="Alex Johnson"
            error={fieldErrors.name}
          />
        </div>

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
            autoComplete="new-password"
            aria-required="true"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
            }}
            onBlur={() => setPasswordTouched(true)}
            placeholder="Minimum 8 characters"
            error={
              passwordTouched && password && password.length < 8
                ? "Password must be at least 8 characters."
                : fieldErrors.password
            }
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button loading={loading} type="submit" className="mt-2">
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-pitch-400">
        Already have an account?{" "}
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
