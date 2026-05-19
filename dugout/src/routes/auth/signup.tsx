import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

const inputCls =
  "w-full px-4 py-3.5 rounded-xl border border-pitch-700 bg-pitch-800 text-pitch-50 text-base placeholder:text-pitch-500 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-colors";
const labelCls =
  "block text-xs font-display font-600 uppercase tracking-wider text-pitch-300 mb-1.5";

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

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("member");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && accountType === "organizer") {
      await supabase
        .from("profiles")
        .update({ can_create_team: true })
        .eq("id", data.user.id);
    }

    await navigate({ to: "/teams" });
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
          Create your account to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account type */}
        <div>
          <p className={labelCls}>I am a</p>
          <div className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAccountType(opt.value)}
                className={`flex flex-col gap-0.5 px-3 py-3 rounded-xl border text-left transition-colors ${
                  accountType === opt.value
                    ? "border-ember bg-ember-muted"
                    : "border-pitch-700 bg-pitch-800"
                }`}
              >
                <span
                  className={`text-sm font-display font-600 uppercase tracking-wide ${
                    accountType === opt.value ? "text-ember" : "text-pitch-100"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-[11px] text-pitch-400 font-body leading-snug">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className={labelCls}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Alex Johnson"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="Minimum 8 characters"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ember text-white font-display font-700 uppercase tracking-wider py-3.5 rounded-xl text-sm active:bg-ember-600 disabled:opacity-40 transition-colors mt-2"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
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
  );
}
